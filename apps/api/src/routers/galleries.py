import uuid
import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user
from src.models.gallery import Album, AlbumMedia
from src.models.post import Post
from src.models.user import User
from src.schemas.gallery import (
    CreateAlbumRequest,
    UpdateAlbumRequest,
    AddMediaRequest,
    AlbumResponse,
    AlbumDetailResponse,
    AlbumMediaResponse,
)

router = APIRouter(prefix="/api/galleries", tags=["galleries"])


@router.get("/albums")
async def list_albums(
    album_type: str | None = Query(None, alias="type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Album).options(selectinload(Album.author))
    if album_type:
        query = query.where(Album.album_type == album_type)
    query = query.order_by(Album.created_at.desc())

    total_q = select(func.count(Album.id))
    if album_type:
        total_q = total_q.where(Album.album_type == album_type)
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(skip).limit(limit))
    albums = result.scalars().all()

    items = []
    for a in albums:
        count_q = select(func.count(AlbumMedia.id)).where(AlbumMedia.album_id == a.id)
        count_result = await db.execute(count_q)
        items.append(AlbumResponse(
            id=a.id, title=a.title, description=a.description,
            cover_media_url=a.cover_media_url, author_id=a.author_id,
            author_name=a.author.full_name or a.author.email,
            author_avatar=a.author.avatar_url,
            album_type=a.album_type, media_count=count_result.scalar() or 0,
            created_at=a.created_at, updated_at=a.updated_at,
        ))

    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("/albums", response_model=AlbumResponse, status_code=status.HTTP_201_CREATED)
async def create_album(
    body: CreateAlbumRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    album = Album(
        title=body.title, description=body.description,
        cover_media_url=body.cover_media_url, album_type=body.album_type,
        author_id=current_user.id,
    )
    db.add(album)
    await db.flush()
    await db.refresh(album)
    return AlbumResponse(
        id=album.id, title=album.title, description=album.description,
        cover_media_url=album.cover_media_url, author_id=album.author_id,
        author_name=current_user.full_name or current_user.email,
        author_avatar=current_user.avatar_url,
        album_type=album.album_type, media_count=0,
        created_at=album.created_at, updated_at=album.updated_at,
    )


@router.get("/albums/{album_id}", response_model=AlbumDetailResponse)
async def get_album(
    album_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Album)
        .where(Album.id == album_id)
        .options(selectinload(Album.author), selectinload(Album.media))
    )
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    return AlbumDetailResponse(
        id=album.id, title=album.title, description=album.description,
        cover_media_url=album.cover_media_url, author_id=album.author_id,
        author_name=album.author.full_name or album.author.email,
        author_avatar=album.author.avatar_url,
        album_type=album.album_type, media_count=len(album.media),
        created_at=album.created_at, updated_at=album.updated_at,
        media=[AlbumMediaResponse(
            id=m.id, url=m.url, thumb_url=m.thumb_url,
            media_type=m.media_type, caption=m.caption,
            width=m.width, height=m.height, order_index=m.order_index,
            created_at=m.created_at,
        ) for m in album.media],
    )


@router.patch("/albums/{album_id}", response_model=AlbumResponse)
async def update_album(
    album_id: uuid.UUID,
    body: UpdateAlbumRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Album).where(Album.id == album_id).options(selectinload(Album.author))
    )
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    if album.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(album, field, value)
    album.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(album)

    count_q = select(func.count(AlbumMedia.id)).where(AlbumMedia.album_id == album.id)
    count_result = await db.execute(count_q)

    return AlbumResponse(
        id=album.id, title=album.title, description=album.description,
        cover_media_url=album.cover_media_url, author_id=album.author_id,
        author_name=album.author.full_name or album.author.email,
        author_avatar=album.author.avatar_url,
        album_type=album.album_type, media_count=count_result.scalar() or 0,
        created_at=album.created_at, updated_at=album.updated_at,
    )


@router.delete("/albums/{album_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_album(
    album_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    album = await db.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    if album.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(album)


@router.post("/albums/{album_id}/media", response_model=AlbumMediaResponse, status_code=status.HTTP_201_CREATED)
async def add_media(
    album_id: uuid.UUID,
    body: AddMediaRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    album = await db.get(Album, album_id)
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
    if album.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    media = AlbumMedia(
        album_id=album_id, url=body.url, thumb_url=body.thumb_url,
        media_type=body.media_type, caption=body.caption,
        width=body.width, height=body.height, order_index=body.order_index,
    )
    db.add(media)
    await db.flush()
    await db.refresh(media)
    if not album.cover_media_url:
        album.cover_media_url = body.url
    return AlbumMediaResponse(
        id=media.id, url=media.url, thumb_url=media.thumb_url,
        media_type=media.media_type, caption=media.caption,
        width=media.width, height=media.height, order_index=media.order_index,
        created_at=media.created_at,
    )


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AlbumMedia).where(AlbumMedia.id == media_id).options(selectinload(AlbumMedia.album))
    )
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    if media.album.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(media)


@router.get("/feed-media")
async def get_feed_media(
    media_type: str | None = Query(None, alias="type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(30, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Post).where(
        Post.is_deleted == False,
        Post.media_urls.isnot(None),
        func.jsonb_array_length(Post.media_urls) > 0,
    )
    count_q = select(func.count(Post.id)).where(
        Post.is_deleted == False,
        Post.media_urls.isnot(None),
        func.jsonb_array_length(Post.media_urls) > 0,
    )
    query = query.order_by(Post.created_at.desc()).options(selectinload(Post.author))
    result = await db.execute(query.offset(skip).limit(limit))
    posts = result.scalars().all()

    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    items = []
    for post in posts:
        urls = post.media_urls or []
        for url in urls:
            is_video = bool(re.match(r".*\.(mp4|webm|mov|avi|mkv|wmv)(\?.*)?$", url, re.IGNORECASE))
            is_photo = bool(re.match(r".*\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$", url, re.IGNORECASE))
            mt = "video" if is_video else ("photo" if is_photo else None)
            if media_type and mt != media_type:
                continue
            if not mt:
                continue
            items.append({
                "id": str(post.id),
                "url": url,
                "media_type": mt,
                "caption": post.content[:200] if post.content else None,
                "author_id": str(post.author_id),
                "author_name": post.author.full_name or post.author.email,
                "author_avatar": post.author.avatar_url,
                "post_id": str(post.id),
                "created_at": post.created_at.isoformat(),
            })

    return {"items": items, "total": total, "skip": skip, "limit": limit}
