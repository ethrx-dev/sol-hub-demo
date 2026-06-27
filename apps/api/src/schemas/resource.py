from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class ResourceCreateRequest(BaseModel):
    title: str
    description: str | None = None
    url: str | None = None
    resource_type: str
    sector: str | None = None
    tags: list[str] = []


class ResourceUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    url: str | None = None
    resource_type: str | None = None
    sector: str | None = None
    tags: list[str] | None = None


class ResourceResponse(BaseResponseWithUUID):
    id: str
    author_id: str
    title: str
    description: str | None = None
    url: str | None = None
    resource_type: str
    sector: str | None = None
    tags: list = []
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
