from datetime import datetime, timezone

from sqlalchemy import Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from src.database import Base


class MatchSettings(Base):
    """Singleton (id=1) holding the weighting factors used by the matching
    algorithm plus the quality-match alert threshold. Admin-editable at runtime
    so Whitney can tune resonance scoring without a deploy."""

    __tablename__ = "match_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)

    sector_weight: Mapped[int] = mapped_column(Integer, default=25)
    skill_weight: Mapped[int] = mapped_column(Integer, default=20)
    mentor_exact_weight: Mapped[int] = mapped_column(Integer, default=30)
    mentor_partial_weight: Mapped[int] = mapped_column(Integer, default=10)
    guided_weight: Mapped[int] = mapped_column(Integer, default=25)
    quality_threshold: Mapped[int] = mapped_column(Integer, default=70)

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
