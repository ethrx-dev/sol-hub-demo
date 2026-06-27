from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from .common import BaseResponseWithUUID


class NotificationResponse(BaseResponseWithUUID):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    link: Optional[str] = None
    read: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}
