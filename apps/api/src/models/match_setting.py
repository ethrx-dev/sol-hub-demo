from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class MatchSetting(Base):
    __tablename__ = "match_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    sector_weight: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    skill_weight: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    mentor_exact_weight: Mapped[int] = mapped_column(Integer, default=25, nullable=False)
    mentor_partial_weight: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    guided_weight: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    quality_threshold: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    ai_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_weight: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), default=None, onupdate=lambda: datetime.now(timezone.utc))
