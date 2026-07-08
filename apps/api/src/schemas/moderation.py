from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.models.moderation import ReportStatus


class CreateReportRequest(BaseModel):
    target_type: str
    target_id: str
    reason: str
    description: str | None = None


class ReportResponse(BaseModel):
    id: UUID
    reporter_id: UUID
    reporter_name: str = ""
    target_type: str
    target_id: str
    reason: str
    description: str | None = None
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateReportStatusRequest(BaseModel):
    status: ReportStatus


class BlockResponse(BaseModel):
    id: UUID
    blocked_id: UUID
    blocked_name: str = ""
    blocked_avatar: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
