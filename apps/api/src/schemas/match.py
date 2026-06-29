from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class MatchCreateRequest(BaseModel):
    project_id: str
    mentor_id: str | None = None
    investor_id: str | None = None
    notes: str | None = None


class MatchUpdateRequest(BaseModel):
    status: str


class MatchResponse(BaseResponseWithUUID):
    id: str
    project_id: str
    project_title: str | None = None
    mentor_id: str | None = None
    investor_id: str | None = None
    matched_user_name: str | None = None
    matched_user_avatar: str | None = None
    matched_user_role: str | None = None
    status: str
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
