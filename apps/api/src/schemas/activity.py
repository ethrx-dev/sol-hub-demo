from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str = ""
    user_avatar: str | None = None
    activity_type: str
    description: str
    target_type: str | None = None
    target_id: str | None = None
    meta_data: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True
