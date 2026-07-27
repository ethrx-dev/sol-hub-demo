import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database import Base


class PillarSubmission(Base):
    __tablename__ = "pillar_submissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pillar = Column(String(32), nullable=False)
    video_size = Column(Integer, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    storage_url = Column(Text, nullable=True)
    storage_key = Column(String(255), nullable=True)
    mentor_type = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
