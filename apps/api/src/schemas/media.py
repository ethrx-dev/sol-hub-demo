from pydantic import BaseModel


class UploadResponse(BaseModel):
    url: str
    storage_key: str
    file_type: str
    file_size: int
