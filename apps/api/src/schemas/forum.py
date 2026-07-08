from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ForumCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    display_order: int = 0
    thread_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ForumThreadResponse(BaseModel):
    id: UUID
    category_id: UUID
    author_id: UUID
    author_name: str = ""
    author_avatar: str | None = None
    title: str
    content: str
    is_pinned: bool = False
    is_locked: bool = False
    view_count: int = 0
    reply_count: int = 0
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class ForumThreadDetailResponse(ForumThreadResponse):
    replies: list["ForumReplyResponse"] = []


class ForumReplyResponse(BaseModel):
    id: UUID
    thread_id: UUID
    author_id: UUID
    author_name: str = ""
    author_avatar: str | None = None
    content: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class CreateForumCategoryRequest(BaseModel):
    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    display_order: int = 0


class CreateForumThreadRequest(BaseModel):
    title: str = Field(max_length=255)
    content: str = Field(max_length=50000)


class CreateForumReplyRequest(BaseModel):
    content: str = Field(max_length=50000)


class UpdateForumThreadRequest(BaseModel):
    title: str | None = None
    content: str | None = None


class UpdateForumReplyRequest(BaseModel):
    content: str


class PaginatedResponse(BaseModel):
    items: list
    total: int
    skip: int = 0
    limit: int = 20
