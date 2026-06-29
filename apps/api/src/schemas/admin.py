from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import BaseResponseWithUUID


class AdminSeedRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class ChangeRoleRequest(BaseModel):
    role: str


class ChangeProjectStatusRequest(BaseModel):
    status: str


class AdminMatchCreateRequest(BaseModel):
    project_id: str
    mentor_id: str | None = None
    investor_id: str | None = None
    notes: str | None = None


class AdminUserResponse(BaseResponseWithUUID):
    id: str
    email: str
    full_name: str
    role: str
    is_super_admin: bool = False
    is_active: bool
    membership_tier: str
    onboarding_completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class AdminGroupResponse(BaseResponseWithUUID):
    id: str
    name: str
    description: str | None = None
    visibility: str
    member_count: int = 0
    creator_name: str | None = None
    is_deleted: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AdminPostResponse(BaseResponseWithUUID):
    id: str
    author_name: str | None = None
    content: str
    like_count: int = 0
    comment_count: int = 0
    is_deleted: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class AdminResourceResponse(BaseResponseWithUUID):
    id: str
    title: str
    resource_type: str
    author_name: str | None = None
    is_published: bool = True
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class DashboardStatsResponse(BaseModel):
    total_users: int = 0
    total_projects: int = 0
    total_matches: int = 0
    total_groups: int = 0
    total_posts: int = 0
    total_resources: int = 0
    active_projects: int = 0
    revenue: float = 0.0
