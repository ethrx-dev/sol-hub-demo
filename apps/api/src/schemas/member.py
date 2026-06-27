from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class MemberResponse(BaseResponseWithUUID):
    id: str
    full_name: str
    email: str
    avatar_url: str | None = None
    role: str
    bio: str | None = None
    skills: list = []
    sectors_of_interest: list = []
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
