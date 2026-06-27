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
    is_active: bool
    membership_tier: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class DashboardStatsResponse(BaseModel):
    total_users: int = 0
    total_projects: int = 0
    total_matches: int = 0
    active_projects: int = 0
    revenue: float = 0.0
