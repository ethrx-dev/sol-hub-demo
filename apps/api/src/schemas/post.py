from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from .common import BaseResponseWithUUID


class PostCreate(BaseModel):
    content: str
    media_urls: list = []
    visibility: str = "members_only"


class PostResponse(BaseResponseWithUUID):
    id: str
    author_id: str
    content: str
    media_urls: list = []
    visibility: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
    page: int
    page_size: int
