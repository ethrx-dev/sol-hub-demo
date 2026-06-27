from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class MilestoneCreateRequest(BaseModel):
    title: str
    description: str | None = None
    due_date: datetime | None = None
    budget: float | None = None
    is_funding_trigger: bool = False


class MilestoneUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    due_date: datetime | None = None
    budget: float | None = None
    is_funding_trigger: bool | None = None


class MilestoneResponse(BaseResponseWithUUID):
    id: str
    project_id: str
    title: str
    description: str | None = None
    status: str
    due_date: datetime | None = None
    budget: float | None = None
    is_funding_trigger: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
