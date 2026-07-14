import hashlib
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, status, Query, Header
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from src.config import settings
from src.deps import DbSession, CurrentAdmin
from src.models.user import User
from src.models.refresh_token import RefreshToken
from src.models.project import Project
from src.models.match import Match
from src.models.investment import Investment
from src.models.group import Group
from src.models.post import Post
from src.models.resource import Resource
from src.models.blog import BlogPost, ReviewStatus
from src.models.donation import Donation
from src.schemas.blog import BlogPostResponse
from src.schemas.admin import (
    AdminSeedRequest,
    ChangeRoleRequest,
    ChangeProjectStatusRequest,
    AdminMatchCreateRequest,
    AdminUserResponse,
    AdminGroupResponse,
    AdminPostResponse,
    AdminResourceResponse,
    DashboardStatsResponse,
)
from src.schemas.auth import TokenResponse
from src.schemas.project import ProjectResponse
from src.schemas.match import MatchResponse
from src.schemas.common import MessageResponse, PaginatedResponse
from src.utils.security import hash_password, create_access_token, create_refresh_token

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/seed", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def seed_admin(
    body: AdminSeedRequest,
    db: DbSession,
    x_admin_secret: str = Header(..., alias="X-Admin-Secret"),
):
    if not settings.ADMIN_SEED_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin seeding is not configured on this server",
        )
    if x_admin_secret != settings.ADMIN_SEED_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin seed secret",
        )

    existing_admin = await db.execute(select(User).where(User.role == "admin").limit(1))
    if existing_admin.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin user already exists. Seed can only be used once.",
        )

    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        full_name=body.full_name,
        role="admin",
        is_super_admin=True,
        onboarding_completed=True,
    )
    db.add(user)
    await db.flush()

    access_token = create_access_token(user.id)
    refresh_token_str = create_refresh_token(user.id)
    token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    db.add(RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    ))

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: DbSession, current_admin: CurrentAdmin):
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_projects = await db.scalar(select(func.count(Project.id))) or 0
    total_matches = await db.scalar(select(func.count(Match.id))) or 0
    total_groups = await db.scalar(select(func.count(Group.id)).where(Group.is_deleted == False)) or 0
    total_posts = await db.scalar(select(func.count(Post.id)).where(Post.is_deleted == False)) or 0
    total_resources = await db.scalar(select(func.count(Resource.id))) or 0
    active_projects = await db.scalar(
        select(func.count(Project.id)).where(Project.status == "active")
    ) or 0

    revenue_result = await db.scalar(
        select(func.coalesce(func.sum(Investment.amount), 0)).where(Investment.status == "committed")
    ) or 0.0

    return DashboardStatsResponse(
        total_users=total_users,
        total_projects=total_projects,
        total_matches=total_matches,
        total_groups=total_groups,
        total_posts=total_posts,
        total_resources=total_resources,
        active_projects=active_projects,
        revenue=float(revenue_result),
    )


# ── Users ──────────────────────────────────────────────────────────

@router.get("/users", response_model=PaginatedResponse[AdminUserResponse])
async def list_all_users(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    total = await db.scalar(select(func.count(User.id)))
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def get_user(user_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
async def change_user_role(
    user_id: uuid.UUID,
    body: ChangeRoleRequest,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    if body.role not in ("innovator", "mentor", "investor", "admin"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.role = body.role
    await db.flush()
    return user


@router.post("/users/{user_id}/toggle-super-admin", response_model=AdminUserResponse)
async def toggle_super_admin(
    user_id: uuid.UUID,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can manage super admin status")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_super_admin = not user.is_super_admin
    await db.flush()
    return user


@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(user_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can delete users")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    await db.flush()
    return {"detail": "User deactivated successfully"}


# ── Projects ───────────────────────────────────────────────────────

@router.get("/projects", response_model=PaginatedResponse[ProjectResponse])
async def list_all_projects(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(Project.id)))
    result = await db.execute(
        select(Project).order_by(Project.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.patch("/projects/{project_id}/status", response_model=ProjectResponse)
async def change_project_status(
    project_id: uuid.UUID,
    body: ChangeProjectStatusRequest,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    if body.status not in ("draft", "submitted", "active", "funded", "completed", "cancelled"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid project status")

    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    project.status = body.status
    await db.flush()
    return project


# ── Matches ────────────────────────────────────────────────────────

@router.post("/matches", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_match(body: AdminMatchCreateRequest, db: DbSession, current_admin: CurrentAdmin):
    project_result = await db.execute(
        select(Project).where(Project.id == uuid.UUID(body.project_id), Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    mentor_id = uuid.UUID(body.mentor_id) if body.mentor_id else None
    investor_id = uuid.UUID(body.investor_id) if body.investor_id else None

    if not mentor_id and not investor_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one of mentor_id or investor_id is required")

    if mentor_id:
        mentor_result = await db.execute(select(User).where(User.id == mentor_id))
        if not mentor_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    if investor_id:
        investor_result = await db.execute(select(User).where(User.id == investor_id))
        if not investor_result.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investor not found")

    match = Match(
        project_id=project.id,
        mentor_id=mentor_id,
        investor_id=investor_id,
        notes=body.notes,
    )
    db.add(match)
    await db.flush()

    matched_user = None
    if mentor_id and mentor_id != current_admin.id:
        matched_user = await db.get(User, mentor_id)
    elif investor_id and investor_id != current_admin.id:
        matched_user = await db.get(User, investor_id)
    elif mentor_id:
        matched_user = await db.get(User, mentor_id)
    elif investor_id:
        matched_user = await db.get(User, investor_id)

    from src.schemas.match import MatchResponse
    return MatchResponse(
        id=str(match.id),
        project_id=str(match.project_id),
        project_title=project.title,
        mentor_id=str(match.mentor_id) if match.mentor_id else None,
        investor_id=str(match.investor_id) if match.investor_id else None,
        matched_user_name=matched_user.full_name if matched_user else None,
        matched_user_avatar=matched_user.avatar_url if matched_user else None,
        matched_user_role=matched_user.role if matched_user else None,
        status=match.status.value if hasattr(match.status, 'value') else match.status,
        notes=match.notes,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


@router.get("/matches", response_model=PaginatedResponse[MatchResponse])
async def list_all_matches(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    from src.schemas.match import MatchResponse
    total = await db.scalar(select(func.count(Match.id)))
    result = await db.execute(
        select(Match).order_by(Match.created_at.desc()).offset(skip).limit(limit)
    )
    matches = result.scalars().all()
    items = []
    for match in matches:
        project = await db.get(Project, match.project_id)
        project_title = project.title if project else None
        matched_user = None
        if match.mentor_id:
            matched_user = await db.get(User, match.mentor_id)
        elif match.investor_id:
            matched_user = await db.get(User, match.investor_id)
        items.append(MatchResponse(
            id=str(match.id),
            project_id=str(match.project_id),
            project_title=project_title,
            mentor_id=str(match.mentor_id) if match.mentor_id else None,
            investor_id=str(match.investor_id) if match.investor_id else None,
            matched_user_name=matched_user.full_name if matched_user else None,
            matched_user_avatar=matched_user.avatar_url if matched_user else None,
            matched_user_role=matched_user.role if matched_user else None,
            status=match.status.value if hasattr(match.status, 'value') else match.status,
            notes=match.notes,
            created_at=match.created_at,
            updated_at=match.updated_at,
        ))
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


# ── Groups (super admin) ───────────────────────────────────────────

@router.get("/groups", response_model=PaginatedResponse[AdminGroupResponse])
async def list_all_groups(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(Group.id)))
    result = await db.execute(
        select(Group, User.full_name)
        .outerjoin(User, Group.creator_id == User.id)
        .order_by(Group.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = []
    for group, creator_name in result.all():
        member_count = await db.scalar(
            select(func.count()).select_from(type(group).__table__).where(
                type(group).__table__.c.id == group.id
            )
        ) or 0
        # simpler: count group_members
        from src.models.group_member import GroupMember
        mc = await db.scalar(
            select(func.count(GroupMember.id)).where(GroupMember.group_id == group.id)
        ) or 0
        items.append(AdminGroupResponse(
            id=str(group.id),
            name=group.name,
            description=group.description,
            visibility=group.visibility,
            member_count=mc,
            creator_name=creator_name,
            is_deleted=group.is_deleted,
            created_at=group.created_at,
        ))
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.delete("/groups/{group_id}", response_model=MessageResponse)
async def admin_delete_group(group_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can delete groups")
    result = await db.execute(select(Group).where(Group.id == group_id))
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    group.is_deleted = True
    await db.flush()
    return {"detail": "Group deleted successfully"}


# ── Posts (super admin) ────────────────────────────────────────────

@router.get("/posts", response_model=PaginatedResponse[AdminPostResponse])
async def list_all_posts(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(Post.id)))
    result = await db.execute(
        select(Post, User.full_name)
        .outerjoin(User, Post.author_id == User.id)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = []
    for post, author_name in result.all():
        from src.models.like import Like
        from src.models.comment import Comment
        like_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id)) or 0
        comment_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id)) or 0
        items.append(AdminPostResponse(
            id=str(post.id),
            author_name=author_name,
            content=post.content,
            like_count=like_count,
            comment_count=comment_count,
            is_deleted=post.is_deleted,
            created_at=post.created_at,
        ))
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.delete("/posts/{post_id}", response_model=MessageResponse)
async def admin_delete_post(post_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can delete posts")
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.is_deleted = True
    await db.flush()
    return {"detail": "Post deleted successfully"}


# ── Resources (super admin) ────────────────────────────────────────

@router.get("/resources", response_model=PaginatedResponse[AdminResourceResponse])
async def list_all_resources(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(Resource.id)))
    result = await db.execute(
        select(Resource, User.full_name)
        .outerjoin(User, Resource.author_id == User.id)
        .order_by(Resource.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = []
    for resource, author_name in result.all():
        items.append(AdminResourceResponse(
            id=str(resource.id),
            title=resource.title,
            resource_type=resource.resource_type,
            author_name=author_name,
            is_published=resource.is_published,
            created_at=resource.created_at,
        ))
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.delete("/resources/{resource_id}", response_model=MessageResponse)
async def admin_delete_resource(resource_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can delete resources")
    result = await db.execute(select(Resource).where(Resource.id == resource_id))
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    await db.delete(resource)
    await db.flush()
    return {"detail": "Resource deleted successfully"}


# ── Story Review (Feature 3: Post-Onboarding) ──────────────────────


@router.get("/stories", response_model=PaginatedResponse[BlogPostResponse])
async def list_stories(
    db: DbSession,
    current_admin: CurrentAdmin,
    review_status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    query = select(BlogPost).where(BlogPost.review_status != "none").options(
        selectinload(BlogPost.author)
    )
    count_q = select(func.count(BlogPost.id)).where(BlogPost.review_status != "none")
    if review_status:
        query = query.where(BlogPost.review_status == review_status)
        count_q = count_q.where(BlogPost.review_status == review_status)
    total = await db.scalar(count_q)
    result = await db.execute(query.order_by(BlogPost.created_at.desc()).offset(skip).limit(limit))
    posts = result.scalars().all()
    return {
        "items": [
            BlogPostResponse(
                id=p.id, title=p.title, slug=p.slug, content=p.content,
                excerpt=p.excerpt, cover_image=p.cover_image,
                author_id=p.author_id, author_name=p.author.full_name or p.author.email,
                author_avatar=p.author.avatar_url,
                category_id=p.category_id, category_name=None,
                tags=[t.strip() for t in p.tags.split(",") if t.strip()], status=p.status, review_status=p.review_status,
                review_notes=p.review_notes, is_featured=p.is_featured,
                view_count=p.view_count, published_at=p.published_at,
                created_at=p.created_at, updated_at=p.updated_at,
            )
            for p in posts
        ],
        "total": total or 0, "skip": skip, "limit": limit,
    }


@router.post("/stories/{story_id}/approve", response_model=BlogPostResponse)
async def approve_story(
    story_id: uuid.UUID,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == story_id).options(selectinload(BlogPost.author))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    post.review_status = ReviewStatus.approved
    post.reviewed_by_id = current_admin.id
    post.reviewed_at = datetime.now(timezone.utc)
    await db.flush()

    from src.utils.notifications import notify_story_approved
    await notify_story_approved(db, post.author, post)

    return BlogPostResponse(
        id=post.id, title=post.title, slug=post.slug, content=post.content,
        excerpt=post.excerpt, cover_image=post.cover_image,
        author_id=post.author_id, author_name=post.author.full_name or post.author.email,
        author_avatar=post.author.avatar_url,
        category_id=post.category_id, category_name=None,
        tags=[t.strip() for t in post.tags.split(",") if t.strip()], status=post.status, review_status=post.review_status,
        review_notes=post.review_notes, is_featured=post.is_featured,
        view_count=post.view_count, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
    )


class StoryRejectRequest(BaseModel):
    notes: str = ""


@router.post("/stories/{story_id}/reject", response_model=BlogPostResponse)
async def reject_story(
    story_id: uuid.UUID,
    body: StoryRejectRequest,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == story_id).options(selectinload(BlogPost.author))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Story not found")
    post.review_status = ReviewStatus.rejected
    post.review_notes = body.notes
    post.reviewed_by_id = current_admin.id
    post.reviewed_at = datetime.now(timezone.utc)
    await db.flush()

    from src.utils.notifications import notify_story_rejected
    await notify_story_rejected(db, post.author, post, body.notes)

    return BlogPostResponse(
        id=post.id, title=post.title, slug=post.slug, content=post.content,
        excerpt=post.excerpt, cover_image=post.cover_image,
        author_id=post.author_id, author_name=post.author.full_name or post.author.email,
        author_avatar=post.author.avatar_url,
        category_id=post.category_id, category_name=None,
        tags=[t.strip() for t in post.tags.split(",") if t.strip()], status=post.status, review_status=post.review_status,
        review_notes=post.review_notes, is_featured=post.is_featured,
        view_count=post.view_count, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
    )


@router.get("/donations")
async def list_donations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: DbSession = None,
    current_admin: CurrentAdmin = None,
):
    result = await db.execute(
        select(Donation).order_by(Donation.created_at.desc()).offset(skip).limit(limit)
    )
    donations = result.scalars().all()

    total_q = select(func.count(Donation.id))
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    sum_q = select(func.sum(Donation.amount)).where(Donation.status == "completed")
    sum_result = await db.execute(sum_q)
    total_amount = sum_result.scalar() or 0

    return {
        "items": [
            {
                "id": str(d.id),
                "amount": d.amount,
                "currency": d.currency,
                "donorName": d.donor_name,
                "donorEmail": d.donor_email,
                "userId": str(d.user_id) if d.user_id else None,
                "status": d.status,
                "receiptUrl": d.receipt_url,
                "createdAt": d.created_at.isoformat() if d.created_at else None,
            }
            for d in donations
        ],
        "total": total,
        "totalAmount": total_amount,
    }
