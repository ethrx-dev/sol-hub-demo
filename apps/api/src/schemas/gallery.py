from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.models.gallery import AlbumType, MediaType


class AlbumMediaResponse(BaseModel):
    id: UUID
    url: str
    thumb_url: str | None = None
    media_type: MediaType
    caption: str | None = None
    width: int | None = None
    height: int | None = None
    order_index: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class AlbumResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    cover_media_url: str | None = None
    author_id: UUID
    author_name: str = ""
    author_avatar: str | None = None
    album_type: AlbumType = AlbumType.photo
    media_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class AlbumDetailResponse(AlbumResponse):
    media: list[AlbumMediaResponse] = []


class CreateAlbumRequest(BaseModel):
    title: str
    description: str | None = None
    cover_media_url: str | None = None
    album_type: AlbumType = AlbumType.photo


class UpdateAlbumRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    cover_media_url: str | None = None
    album_type: AlbumType | None = None


class AddMediaRequest(BaseModel):
    url: str
    thumb_url: str | None = None
    media_type: MediaType
    caption: str | None = None
    width: int | None = None
    height: int | None = None
    order_index: int = 0
