from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from src.models.event import EventStatus, AttendeeStatus


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    location: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    is_virtual: bool = False
    meeting_url: str | None = None
    cover_image_url: str | None = None
    max_attendees: int | None = None
    organizer_id: UUID
    organizer_name: str = ""
    organizer_avatar: str | None = None
    status: EventStatus = EventStatus.draft
    attendee_count: int = 0
    my_status: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class EventDetailResponse(EventResponse):
    attendees: list["EventAttendeeResponse"] = []


class EventAttendeeResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str = ""
    user_avatar: str | None = None
    status: AttendeeStatus
    created_at: datetime

    class Config:
        from_attributes = True


class CreateEventRequest(BaseModel):
    title: str
    description: str | None = None
    location: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    is_virtual: bool = False
    meeting_url: str | None = None
    cover_image_url: str | None = None
    max_attendees: int | None = None
    status: EventStatus = EventStatus.draft


class UpdateEventRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    is_virtual: bool | None = None
    meeting_url: str | None = None
    cover_image_url: str | None = None
    max_attendees: int | None = None
    status: EventStatus | None = None


class RSVPRequest(BaseModel):
    status: AttendeeStatus
