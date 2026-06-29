import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user
from src.models.forum import ForumCategory, ForumThread, ForumReply
from src.models.user import User
from src.schemas.forum import (
    CreateForumCategoryRequest,
    CreateForumThreadRequest,
    CreateForumReplyRequest,
    ForumCategoryResponse,
    ForumThreadResponse,
    ForumThreadDetailResponse,
    ForumReplyResponse,
    UpdateForumThreadRequest,
    UpdateForumReplyRequest,
    PaginatedResponse,
)

router = APIRouter(prefix="/api/forums", tags=["forums"])


# ── Categories ──


@router.get("/categories", response_model=list[ForumCategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            ForumCategory,
            func.count(ForumThread.id).label("thread_count"),
        )
        .outerjoin(ForumThread, ForumThread.category_id == ForumCategory.id)
        .group_by(ForumCategory.id)
        .order_by(ForumCategory.display_order)
    )
    rows = result.all()
    return [
        ForumCategoryResponse(
            id=cat.id,
            name=cat.name,
            slug=cat.slug,
            description=cat.description,
            icon=cat.icon,
            display_order=cat.display_order,
            thread_count=thread_count,
            created_at=cat.created_at,
        )
        for cat, thread_count in rows
    ]


@router.post("/categories", response_model=ForumCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CreateForumCategoryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create categories")
    cat = ForumCategory(
        name=body.name,
        slug=body.slug,
        description=body.description,
        icon=body.icon,
        display_order=body.display_order,
    )
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return ForumCategoryResponse(
        id=cat.id, name=cat.name, slug=cat.slug, description=cat.description,
        icon=cat.icon, display_order=cat.display_order, thread_count=0, created_at=cat.created_at,
    )


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can delete categories")
    cat = await db.get(ForumCategory, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await db.delete(cat)


# ── Threads ──


@router.get("/categories/{category_id}/threads")
async def list_threads(
    category_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    total_q = select(func.count(ForumThread.id)).where(ForumThread.category_id == category_id)
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    result = await db.execute(
        select(ForumThread)
        .where(ForumThread.category_id == category_id)
        .options(selectinload(ForumThread.author))
        .order_by(ForumThread.is_pinned.desc(), ForumThread.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    threads = result.scalars().all()

    items = []
    for t in threads:
        reply_count_q = select(func.count(ForumReply.id)).where(ForumReply.thread_id == t.id)
        reply_result = await db.execute(reply_count_q)
        reply_count = reply_result.scalar() or 0
        items.append(ForumThreadResponse(
            id=t.id, category_id=t.category_id, author_id=t.author_id,
            author_name=t.author.full_name or t.author.email,
            author_avatar=t.author.avatar_url,
            title=t.title, content=t.content,
            is_pinned=t.is_pinned, is_locked=t.is_locked, view_count=t.view_count,
            reply_count=reply_count, created_at=t.created_at, updated_at=t.updated_at,
        ))

    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/categories/{category_id}/threads", response_model=ForumThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_thread(
    category_id: uuid.UUID,
    body: CreateForumThreadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cat = await db.get(ForumCategory, category_id)
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    thread = ForumThread(
        category_id=category_id,
        author_id=current_user.id,
        title=body.title,
        content=body.content,
    )
    db.add(thread)
    await db.flush()
    await db.refresh(thread)
    return ForumThreadResponse(
        id=thread.id, category_id=thread.category_id, author_id=thread.author_id,
        author_name=current_user.full_name or current_user.email,
        author_avatar=current_user.avatar_url,
        title=thread.title, content=thread.content,
        is_pinned=thread.is_pinned, is_locked=thread.is_locked, view_count=thread.view_count,
        reply_count=0, created_at=thread.created_at, updated_at=thread.updated_at,
    )


@router.get("/threads/{thread_id}", response_model=ForumThreadDetailResponse)
async def get_thread(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ForumThread)
        .where(ForumThread.id == thread_id)
        .options(selectinload(ForumThread.author), selectinload(ForumThread.replies).selectinload(ForumReply.author))
    )
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")

    thread.view_count += 1
    await db.flush()

    replies = [
        ForumReplyResponse(
            id=r.id, thread_id=r.thread_id, author_id=r.author_id,
            author_name=r.author.full_name or r.author.email,
            author_avatar=r.author.avatar_url,
            content=r.content, created_at=r.created_at, updated_at=r.updated_at,
        )
        for r in thread.replies
    ]

    return ForumThreadDetailResponse(
        id=thread.id, category_id=thread.category_id, author_id=thread.author_id,
        author_name=thread.author.full_name or thread.author.email,
        author_avatar=thread.author.avatar_url,
        title=thread.title, content=thread.content,
        is_pinned=thread.is_pinned, is_locked=thread.is_locked, view_count=thread.view_count,
        reply_count=len(replies), created_at=thread.created_at, updated_at=thread.updated_at,
        replies=replies,
    )


@router.patch("/threads/{thread_id}", response_model=ForumThreadResponse)
async def update_thread(
    thread_id: uuid.UUID,
    body: UpdateForumThreadRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ForumThread).where(ForumThread.id == thread_id).options(selectinload(ForumThread.author))
    )
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if thread.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    if body.title is not None:
        thread.title = body.title
    if body.content is not None:
        thread.content = body.content
    thread.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(thread)
    return ForumThreadResponse(
        id=thread.id, category_id=thread.category_id, author_id=thread.author_id,
        author_name=thread.author.full_name or thread.author.email,
        author_avatar=thread.author.avatar_url,
        title=thread.title, content=thread.content,
        is_pinned=thread.is_pinned, is_locked=thread.is_locked, view_count=thread.view_count,
        reply_count=0, created_at=thread.created_at, updated_at=thread.updated_at,
    )


@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_thread(
    thread_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if thread.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(thread)


# ── Replies ──


@router.get("/threads/{thread_id}/replies")
async def list_replies(
    thread_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    total_q = select(func.count(ForumReply.id)).where(ForumReply.thread_id == thread_id)
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    result = await db.execute(
        select(ForumReply)
        .where(ForumReply.thread_id == thread_id)
        .options(selectinload(ForumReply.author))
        .order_by(ForumReply.created_at)
        .offset(skip)
        .limit(limit)
    )
    replies = result.scalars().all()
    items = [
        ForumReplyResponse(
            id=r.id, thread_id=r.thread_id, author_id=r.author_id,
            author_name=r.author.full_name or r.author.email,
            author_avatar=r.author.avatar_url,
            content=r.content, created_at=r.created_at, updated_at=r.updated_at,
        )
        for r in replies
    ]
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("/threads/{thread_id}/replies", response_model=ForumReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_reply(
    thread_id: uuid.UUID,
    body: CreateForumReplyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    if thread.is_locked:
        raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="Thread is locked")

    reply = ForumReply(thread_id=thread_id, author_id=current_user.id, content=body.content)
    db.add(reply)
    thread.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(reply)
    return ForumReplyResponse(
        id=reply.id, thread_id=reply.thread_id, author_id=reply.author_id,
        author_name=current_user.full_name or current_user.email,
        author_avatar=current_user.avatar_url,
        content=reply.content, created_at=reply.created_at, updated_at=reply.updated_at,
    )


@router.patch("/replies/{reply_id}", response_model=ForumReplyResponse)
async def update_reply(
    reply_id: uuid.UUID,
    body: UpdateForumReplyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ForumReply).where(ForumReply.id == reply_id).options(selectinload(ForumReply.author))
    )
    reply = result.scalar_one_or_none()
    if not reply:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reply not found")
    if reply.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    reply.content = body.content
    reply.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(reply)
    return ForumReplyResponse(
        id=reply.id, thread_id=reply.thread_id, author_id=reply.author_id,
        author_name=reply.author.full_name or reply.author.email,
        author_avatar=reply.author.avatar_url,
        content=reply.content, created_at=reply.created_at, updated_at=reply.updated_at,
    )


@router.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reply(
    reply_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(ForumReply).where(ForumReply.id == reply_id))
    reply = result.scalar_one_or_none()
    if not reply:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reply not found")
    if reply.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(reply)
