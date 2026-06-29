from datetime import datetime
from pydantic import BaseModel

from .common import BaseResponseWithUUID


class NotificationPreferenceResponse(BaseResponseWithUUID):
    id: str
    user_id: str
    matches: bool = True
    messages: bool = True
    milestones: bool = True
    activity: bool = True
    email_matches: bool = True
    email_messages: bool = True
    email_milestones: bool = True
    email_activity: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class UpdateNotificationPreferenceRequest(BaseModel):
    matches: bool | None = None
    messages: bool | None = None
    milestones: bool | None = None
    activity: bool | None = None
    email_matches: bool | None = None
    email_messages: bool | None = None
    email_milestones: bool | None = None
    email_activity: bool | None = None
