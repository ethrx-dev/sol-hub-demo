from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class GroupCreateRequest(BaseModel):
    name: str
    description: str | None = None
    visibility: str = "public"
    cover_image_url: str | None = None


class GroupUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    visibility: str | None = None
    cover_image_url: str | None = None


class GroupMemberResponse(BaseResponseWithUUID):
    id: str
    user_id: str
    full_name: str | None = None
    avatar_url: str | None = None
    role: str
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class GroupResponse(BaseResponseWithUUID):
    id: str
    creator_id: str
    name: str
    description: str | None = None
    visibility: str
    cover_image_url: str | None = None
    member_count: int = 0
    is_member: bool = False
    is_creator: bool = False
    is_deleted: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None
    members: list[GroupMemberResponse] = []

    model_config = {"from_attributes": True}
