from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    role: str | None = None
    skills: list[str] | None = None
    sectors_of_interest: list[str] | None = None
    onboarding_completed: bool | None = None


class PublicProfileResponse(BaseResponseWithUUID):
    id: str
    full_name: str
    avatar_url: str | None = None
    bio: str | None = None
    role: str
    skills: list = []
    sectors_of_interest: list = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class NotificationResponse(BaseResponseWithUUID):
    id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
