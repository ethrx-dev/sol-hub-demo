from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class ProjectCreateRequest(BaseModel):
    title: str
    tagline: str | None = None
    description: str | None = None
    sector: str
    sub_sector: str | None = None
    stage: str = "idea"
    target_amount: float | None = None
    cover_image_url: str | None = None
    pitch_deck_url: str | None = None
    website_url: str | None = None
    video_url: str | None = None
    team_members: list = []
    budget_breakdown: dict = {}


class ProjectUpdateRequest(BaseModel):
    title: str | None = None
    tagline: str | None = None
    description: str | None = None
    sector: str | None = None
    sub_sector: str | None = None
    stage: str | None = None
    target_amount: float | None = None
    cover_image_url: str | None = None
    pitch_deck_url: str | None = None
    website_url: str | None = None
    video_url: str | None = None
    team_members: list | None = None
    budget_breakdown: dict | None = None


class ProjectResponse(BaseResponseWithUUID):
    id: str
    innovator_id: str
    title: str
    tagline: str | None = None
    description: str | None = None
    sector: str
    sub_sector: str | None = None
    stage: str
    status: str
    target_amount: float | None = None
    raised_amount: float = 0.0
    cover_image_url: str | None = None
    pitch_deck_url: str | None = None
    website_url: str | None = None
    video_url: str | None = None
    team_members: list = []
    is_deleted: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
