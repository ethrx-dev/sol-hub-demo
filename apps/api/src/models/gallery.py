import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class AlbumType(str, enum.Enum):
    photo = "photo"
    video = "video"
    mixed = "mixed"


class MediaType(str, enum.Enum):
    photo = "photo"
    video = "video"


class Album(Base):
    __tablename__ = "albums"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_media_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    album_type: Mapped[AlbumType] = mapped_column(SAEnum(AlbumType), default=AlbumType.photo, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None, onupdate=lambda: datetime.now(timezone.utc))

    author = relationship("User", back_populates="albums")
    media = relationship("AlbumMedia", back_populates="album", cascade="all, delete-orphan", order_by="AlbumMedia.order_index")


class AlbumMedia(Base):
    __tablename__ = "album_media"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    album_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("albums.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    thumb_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    media_type: Mapped[MediaType] = mapped_column(SAEnum(MediaType), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    album = relationship("Album", back_populates="media")
