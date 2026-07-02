from datetime import datetime
from pydantic import BaseModel
from src.schemas.common import BaseResponseWithUUID


class SectionData(BaseModel):
    id: str = ""
    type: str = "text"
    data: dict = {}


class PageCreateRequest(BaseModel):
    slug: str
    title: str
    status: str = "draft"
    layout: str = "default"
    sections: list[SectionData] = []
    seo: dict | None = None


class PageUpdateRequest(BaseModel):
    slug: str | None = None
    title: str | None = None
    status: str | None = None
    layout: str | None = None
    sections: list[SectionData] | None = None
    seo: dict | None = None


class PageResponse(BaseResponseWithUUID):
    id: str
    slug: str
    title: str
    status: str
    layout: str
    sections: list
    seo: dict | None = None
    author_id: str | None = None
    is_deleted: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = {"from_attributes": True}


class PageListResponse(BaseResponseWithUUID):
    id: str
    slug: str
    title: str
    status: str
    layout: str
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = {"from_attributes": True}


class MediaResponse(BaseResponseWithUUID):
    id: str
    filename: str
    original_name: str
    mime_type: str
    size: int
    alt_text: str | None = None
    caption: str | None = None
    url: str
    uploaded_by_id: str | None = None
    created_at: datetime | None = None
    model_config = {"from_attributes": True}


class MediaCreateRequest(BaseModel):
    alt_text: str | None = None
    caption: str | None = None


class PageRevisionResponse(BaseResponseWithUUID):
    id: str
    page_id: str
    sections_snapshot: list
    author_id: str | None = None
    created_at: datetime | None = None
    model_config = {"from_attributes": True}
