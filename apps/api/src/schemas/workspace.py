from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class DocumentResponse(BaseResponseWithUUID):
    id: str
    project_id: str
    uploader_id: str
    filename: str
    file_url: str
    file_type: str
    file_size: int
    category: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    content: str


class MessageResponse(BaseResponseWithUUID):
    id: str
    project_id: str
    sender_id: str
    sender_name: str | None = None
    content: str
    is_read: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class WorkspaceResponse(BaseModel):
    project: dict | None = None
    documents: list[DocumentResponse] = []
    messages: list[MessageResponse] = []
    members: list[dict] = []
    target_amount: float | None = None
    raised_amount: float = 0.0
