from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from src.models.blog import PostStatus


class BlogCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str | None = None
    post_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class BlogPostResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    content: str
    excerpt: str | None = None
    cover_image: str | None = None
    author_id: UUID
    author_name: str = ""
    author_avatar: str | None = None
    category_id: UUID | None = None
    category_name: str | None = None
    tags: str = ""
    status: PostStatus = PostStatus.draft
    is_featured: bool = False
    view_count: int = 0
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class CreateBlogPostRequest(BaseModel):
    title: str = Field(max_length=255)
    content: str = Field(max_length=100000)
    excerpt: str | None = Field(None, max_length=500)
    cover_image: str | None = Field(None, max_length=512)
    category_id: str | None = None
    tags: str = Field(default="", max_length=500)
    status: PostStatus = PostStatus.draft
    is_featured: bool = False


class UpdateBlogPostRequest(BaseModel):
    title: str | None = None
    content: str | None = None
    excerpt: str | None = None
    cover_image: str | None = None
    category_id: str | None = None
    tags: str | None = None
    status: PostStatus | None = None
    is_featured: bool | None = None


class CreateBlogCategoryRequest(BaseModel):
    name: str
    slug: str
    description: str | None = None
