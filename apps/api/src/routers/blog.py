import uuid
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user
from src.models.blog import BlogCategory, BlogPost
from src.models.user import User
from src.schemas.blog import (
    CreateBlogCategoryRequest,
    CreateBlogPostRequest,
    UpdateBlogPostRequest,
    BlogCategoryResponse,
    BlogPostResponse,
)

router = APIRouter(prefix="/api/blog", tags=["blog"])


def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9-]", "", title.lower().replace(" ", "-"))[:200]


@router.get("/categories", response_model=list[BlogCategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogCategory, func.count(BlogPost.id).label("post_count"))
        .outerjoin(BlogPost, BlogPost.category_id == BlogCategory.id)
        .group_by(BlogCategory.id)
        .order_by(BlogCategory.name)
    )
    rows = result.all()
    return [BlogCategoryResponse(id=cat.id, name=cat.name, slug=cat.slug, description=cat.description, post_count=count, created_at=cat.created_at) for cat, count in rows]


@router.post("/categories", response_model=BlogCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(body: CreateBlogCategoryRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create categories")
    cat = BlogCategory(name=body.name, slug=body.slug, description=body.description)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return BlogCategoryResponse(id=cat.id, name=cat.name, slug=cat.slug, description=cat.description, post_count=0, created_at=cat.created_at)


@router.get("/posts")
async def list_posts(
    category_id: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    search: str = Query(""),
    featured: bool | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(BlogPost).options(selectinload(BlogPost.author), selectinload(BlogPost.category_rel))
    count_q = select(func.count(BlogPost.id))

    where = []
    if category_id:
        where.append(BlogPost.category_id == category_id)
    if status_filter:
        where.append(BlogPost.status == status_filter)
    if featured:
        where.append(BlogPost.is_featured == True)
    if search:
        like = f"%{search}%"
        where.append(BlogPost.title.ilike(like) | BlogPost.content.ilike(like) | BlogPost.tags.ilike(like))

    query = query.where(*where).order_by(BlogPost.created_at.desc())
    count_q = count_q.where(*where)

    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(skip).limit(limit))
    posts = result.scalars().all()

    return {
        "items": [
            BlogPostResponse(
                id=p.id, title=p.title, slug=p.slug, content=p.content,
                excerpt=p.excerpt, cover_image=p.cover_image,
                author_id=p.author_id, author_name=p.author.full_name or p.author.email,
                author_avatar=p.author.avatar_url,
                category_id=p.category_id, category_name=p.category_rel.name if p.category_rel else None,
                tags=p.tags, status=p.status, is_featured=p.is_featured,
                view_count=p.view_count, published_at=p.published_at,
                created_at=p.created_at, updated_at=p.updated_at,
            )
            for p in posts
        ],
        "total": total, "skip": skip, "limit": limit,
    }


@router.post("/posts", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(body: CreateBlogPostRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    base_slug = slugify(body.title)
    slug = base_slug
    counter = 1
    while True:
        existing = await db.execute(select(BlogPost).where(BlogPost.slug == slug))
        if not existing.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    post = BlogPost(
        title=body.title, slug=slug, content=body.content, excerpt=body.excerpt,
        cover_image=body.cover_image, author_id=current_user.id,
        category_id=uuid.UUID(body.category_id) if body.category_id else None,
        tags=body.tags, status=body.status, is_featured=body.is_featured,
        published_at=datetime.now(timezone.utc) if body.status == "published" else None,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)
    return BlogPostResponse(
        id=post.id, title=post.title, slug=post.slug, content=post.content,
        excerpt=post.excerpt, cover_image=post.cover_image,
        author_id=post.author_id, author_name=current_user.full_name or current_user.email,
        author_avatar=current_user.avatar_url,
        category_id=post.category_id, category_name=None,
        tags=post.tags, status=post.status, is_featured=post.is_featured,
        view_count=0, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
    )


@router.get("/posts/{post_id}", response_model=BlogPostResponse)
async def get_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == post_id).options(selectinload(BlogPost.author), selectinload(BlogPost.category_rel))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.view_count += 1
    await db.flush()
    return BlogPostResponse(
        id=post.id, title=post.title, slug=post.slug, content=post.content,
        excerpt=post.excerpt, cover_image=post.cover_image,
        author_id=post.author_id, author_name=post.author.full_name or post.author.email,
        author_avatar=post.author.avatar_url,
        category_id=post.category_id, category_name=post.category_rel.name if post.category_rel else None,
        tags=post.tags, status=post.status, is_featured=post.is_featured,
        view_count=post.view_count, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
    )


@router.patch("/posts/{post_id}", response_model=BlogPostResponse)
async def update_post(post_id: uuid.UUID, body: UpdateBlogPostRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(BlogPost).where(BlogPost.id == post_id).options(selectinload(BlogPost.author), selectinload(BlogPost.category_rel))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    update_data = body.model_dump(exclude_unset=True)
    if "category_id" in update_data:
        update_data["category_id"] = uuid.UUID(update_data["category_id"]) if update_data["category_id"] else None
    if body.status == "published" and not post.published_at:
        update_data["published_at"] = datetime.now(timezone.utc)
    for field, value in update_data.items():
        setattr(post, field, value)
    post.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(post)
    return BlogPostResponse(
        id=post.id, title=post.title, slug=post.slug, content=post.content,
        excerpt=post.excerpt, cover_image=post.cover_image,
        author_id=post.author_id, author_name=post.author.full_name or post.author.email,
        author_avatar=post.author.avatar_url,
        category_id=post.category_id, category_name=post.category_rel.name if post.category_rel else None,
        tags=post.tags, status=post.status, is_featured=post.is_featured,
        view_count=post.view_count, published_at=post.published_at,
        created_at=post.created_at, updated_at=post.updated_at,
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(post)
