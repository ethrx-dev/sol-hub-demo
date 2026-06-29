from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class CreatePostRequest(BaseModel):
    content: str
    media_urls: list[str] = []
    privacy: str = "public"


class CommentResponse(BaseResponseWithUUID):
    id: str
    post_id: str
    author_id: str
    author_name: str | None = None
    author_avatar: str | None = None
    content: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class CreateCommentRequest(BaseModel):
    content: str


class PostResponse(BaseResponseWithUUID):
    id: str
    author_id: str
    author_name: str | None = None
    author_avatar: str | None = None
    content: str
    media_urls: list = []
    like_count: int = 0
    comment_count: int = 0
    is_liked: bool = False
    is_deleted: bool = False
    privacy: str = "public"
    created_at: datetime | None = None
    updated_at: datetime | None = None
    comments: list[CommentResponse] = []

    model_config = {"from_attributes": True}
