from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, field_validator

T = TypeVar("T")


class BaseResponseWithUUID(BaseModel):
    @field_validator("*", mode="before")
    @classmethod
    def _coerce_uuid(cls, v):
        if isinstance(v, UUID):
            return str(v)
        return v


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    skip: int = 0
    limit: int = 20


class MessageResponse(BaseModel):
    detail: str


class ErrorResponse(BaseModel):
    detail: str
