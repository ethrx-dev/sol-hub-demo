import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, Float, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    innovator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    sub_sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="idea")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    target_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    raised_amount: Mapped[float] = mapped_column(Float, default=0.0)
    budget_breakdown: Mapped[dict] = mapped_column(JSONB, default=dict)
    cover_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    pitch_deck_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    website_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    team_members: Mapped[list] = mapped_column(JSONB, default=list)
    milestones_enabled: Mapped[bool] = mapped_column(default=True)
    is_deleted: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None, onupdate=lambda: datetime.now(timezone.utc))

    innovator = relationship("User", back_populates="projects")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="project", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="project", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="project", cascade="all, delete-orphan")
