import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    matches: Mapped[bool] = mapped_column(Boolean, default=True)
    messages: Mapped[bool] = mapped_column(Boolean, default=True)
    milestones: Mapped[bool] = mapped_column(Boolean, default=True)
    activity: Mapped[bool] = mapped_column(Boolean, default=True)
    email_matches: Mapped[bool] = mapped_column(Boolean, default=True)
    email_messages: Mapped[bool] = mapped_column(Boolean, default=True)
    email_milestones: Mapped[bool] = mapped_column(Boolean, default=True)
    email_activity: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notification_preferences")
