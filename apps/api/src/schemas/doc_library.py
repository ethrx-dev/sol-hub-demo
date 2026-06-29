from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class DocCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None
    doc_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class DocLibraryItemResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    file_url: str
    file_type: str
    file_size: int | None = None
    thumbnail_url: str | None = None
    category_id: UUID | None = None
    category_name: str | None = None
    author_id: UUID
    author_name: str = ""
    author_avatar: str | None = None
    tags: str = ""
    download_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class CreateDocCategoryRequest(BaseModel):
    name: str
    slug: str
    description: str | None = None


class CreateDocItemRequest(BaseModel):
    title: str
    description: str | None = None
    file_url: str
    file_type: str
    file_size: int | None = None
    thumbnail_url: str | None = None
    category_id: str | None = None
    tags: str = ""


class UpdateDocItemRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    file_url: str | None = None
    file_type: str | None = None
    file_size: int | None = None
    thumbnail_url: str | None = None
    category_id: str | None = None
    tags: str | None = None
