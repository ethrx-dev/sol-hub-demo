from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from .common import BaseResponseWithUUID


class MessageCreate(BaseModel):
    recipient_id: str
    project_id: Optional[str] = None
    content: str


class MessageResponse(BaseResponseWithUUID):
    id: str
    sender_id: str
    recipient_id: str
    project_id: Optional[str] = None
    content: str
    read_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}
