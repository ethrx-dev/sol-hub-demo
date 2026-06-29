from datetime import datetime
from pydantic import BaseModel

from .common import BaseResponseWithUUID


class GroupMessageCreateRequest(BaseModel):
    content: str


class GroupMessageResponse(BaseResponseWithUUID):
    id: str
    group_id: str
    sender_id: str
    sender_name: str | None = None
    sender_avatar: str | None = None
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}
