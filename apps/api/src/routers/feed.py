import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, delete

from src.deps import DbSession, CurrentUser
from src.models.post import Post
from src.models.comment import Comment
from src.models.like import Like
from src.models.user import User
from src.schemas.feed import (
    CreatePostRequest,
    PostResponse,
    CommentResponse,
    CreateCommentRequest,
)
from src.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter(prefix="/api/feed", tags=["feed"])


@router.get("/", response_model=PaginatedResponse[PostResponse])
async def get_feed(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(
        select(func.count(Post.id)).where(Post.is_deleted == False)
    )
    result = await db.execute(
        select(Post, User.full_name, User.avatar_url)
        .join(User, Post.author_id == User.id)
        .where(Post.is_deleted == False)
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()

    items = []
    for post, author_name, author_avatar in rows:
        like_count = await db.scalar(
            select(func.count(Like.id)).where(Like.post_id == post.id)
        )
        comment_count = await db.scalar(
            select(func.count(Comment.id)).where(Comment.post_id == post.id)
        )
        is_liked = bool(
            await db.scalar(
                select(Like.id).where(Like.post_id == post.id, Like.user_id == current_user.id)
            )
        )
        items.append(PostResponse(
            id=str(post.id),
            author_id=str(post.author_id),
            author_name=author_name,
            author_avatar=author_avatar,
            content=post.content,
            media_urls=post.media_urls or [],
            like_count=like_count or 0,
            comment_count=comment_count or 0,
            is_liked=is_liked,
            is_deleted=post.is_deleted,
            created_at=post.created_at,
            updated_at=post.updated_at,
        ))

    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(body: CreatePostRequest, db: DbSession, current_user: CurrentUser):
    post = Post(
        author_id=current_user.id,
        content=body.content,
        media_urls=body.media_urls,
    )
    db.add(post)
    await db.flush()

    return PostResponse(
        id=str(post.id),
        author_id=str(post.author_id),
        author_name=current_user.full_name,
        author_avatar=current_user.avatar_url,
        content=post.content,
        media_urls=post.media_urls or [],
        like_count=0,
        comment_count=0,
        is_liked=False,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Post, User.full_name, User.avatar_url)
        .join(User, Post.author_id == User.id)
        .where(Post.id == post_id, Post.is_deleted == False)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post, author_name, author_avatar = row
    like_count = await db.scalar(select(func.count(Like.id)).where(Like.post_id == post.id))
    comment_count = await db.scalar(select(func.count(Comment.id)).where(Comment.post_id == post.id))
    is_liked = bool(await db.scalar(select(Like.id).where(Like.post_id == post.id, Like.user_id == current_user.id)))

    comments_result = await db.execute(
        select(Comment, User.full_name, User.avatar_url)
        .join(User, Comment.author_id == User.id)
        .where(Comment.post_id == post.id)
        .order_by(Comment.created_at.asc())
    )
    comments = []
    for c, c_name, c_avatar in comments_result.all():
        comments.append(CommentResponse(
            id=str(c.id),
            post_id=str(c.post_id),
            author_id=str(c.author_id),
            author_name=c_name,
            author_avatar=c_avatar,
            content=c.content,
            created_at=c.created_at,
        ))

    return PostResponse(
        id=str(post.id),
        author_id=str(post.author_id),
        author_name=author_name,
        author_avatar=author_avatar,
        content=post.content,
        media_urls=post.media_urls or [],
        like_count=like_count or 0,
        comment_count=comment_count or 0,
        is_liked=is_liked,
        created_at=post.created_at,
        updated_at=post.updated_at,
        comments=comments,
    )


@router.delete("/posts/{post_id}", response_model=MessageResponse)
async def delete_post(post_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Post).where(Post.id == post_id, Post.is_deleted == False))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this post")

    post.is_deleted = True
    await db.flush()
    return {"detail": "Post deleted successfully"}


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def add_comment(post_id: uuid.UUID, body: CreateCommentRequest, db: DbSession, current_user: CurrentUser):
    post_result = await db.execute(select(Post).where(Post.id == post_id, Post.is_deleted == False))
    if not post_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        author_id=current_user.id,
        content=body.content,
    )
    db.add(comment)
    await db.flush()

    return CommentResponse(
        id=str(comment.id),
        post_id=str(comment.post_id),
        author_id=str(comment.author_id),
        author_name=current_user.full_name,
        author_avatar=current_user.avatar_url,
        content=comment.content,
        created_at=comment.created_at,
    )


@router.get("/posts/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(post_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Comment, User.full_name, User.avatar_url)
        .join(User, Comment.author_id == User.id)
        .where(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
    )
    items = []
    for c, c_name, c_avatar in result.all():
        items.append(CommentResponse(
            id=str(c.id),
            post_id=str(c.post_id),
            author_id=str(c.author_id),
            author_name=c_name,
            author_avatar=c_avatar,
            content=c.content,
            created_at=c.created_at,
        ))
    return items


@router.post("/posts/{post_id}/like", response_model=dict)
async def toggle_like(post_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    post_result = await db.execute(select(Post).where(Post.id == post_id, Post.is_deleted == False))
    if not post_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = await db.execute(
        select(Like).where(Like.post_id == post_id, Like.user_id == current_user.id)
    )
    like = existing.scalar_one_or_none()
    if like:
        await db.delete(like)
        return {"liked": False, "detail": "Like removed"}
    else:
        db.add(Like(post_id=post_id, user_id=current_user.id))
        return {"liked": True, "detail": "Post liked"}
