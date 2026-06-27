import hashlib
import uuid
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, status, Query, Header
from sqlalchemy import select, func

from src.config import settings
from src.deps import DbSession, CurrentAdmin
from src.models.user import User
from src.models.refresh_token import RefreshToken
from src.models.project import Project
from src.models.match import Match
from src.models.investment import Investment
from src.schemas.admin import (
    AdminSeedRequest,
    ChangeRoleRequest,
    ChangeProjectStatusRequest,
    AdminMatchCreateRequest,
    AdminUserResponse,
    DashboardStatsResponse,
)
from src.schemas.auth import TokenResponse
from src.schemas.match import MatchResponse
from src.schemas.project import ProjectResponse
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


@router.get("/users", response_model=PaginatedResponse[AdminUserResponse])
async def list_all_users(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(User.id)))
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


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
    return match


@router.get("/matches", response_model=PaginatedResponse[MatchResponse])
async def list_all_matches(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(select(func.count(Match.id)))
    result = await db.execute(
        select(Match).order_by(Match.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: DbSession, current_admin: CurrentAdmin):
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_projects = await db.scalar(select(func.count(Project.id))) or 0
    total_matches = await db.scalar(select(func.count(Match.id))) or 0
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
        active_projects=active_projects,
        revenue=float(revenue_result),
    )
