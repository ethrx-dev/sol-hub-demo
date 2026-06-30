import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user, get_optional_user
from src.models.event import Event, EventAttendee
from src.models.user import User
from src.schemas.event import (
    CreateEventRequest,
    UpdateEventRequest,
    RSVPRequest,
    EventResponse,
    EventDetailResponse,
    EventAttendeeResponse,
    AttendeeStatus,
)

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("")
async def list_events(
    upcoming: bool = Query(False),
    past: bool = Query(False),
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    query = select(Event).options(selectinload(Event.organizer))

    if status_filter:
        query = query.where(Event.status == status_filter)
    else:
        query = query.where(Event.status == "published")

    now = datetime.now(timezone.utc)
    if upcoming:
        query = query.where(Event.start_time >= now).order_by(Event.start_time)
    elif past:
        query = query.where(Event.start_time < now).order_by(Event.start_time.desc())
    else:
        query = query.order_by(Event.start_time.desc())

    total_q = select(func.count(Event.id)).select_from(Event)
    if status_filter:
        total_q = total_q.where(Event.status == status_filter)
    else:
        total_q = total_q.where(Event.status == "published")
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(skip).limit(limit))
    events = result.scalars().all()

    items = []
    for e in events:
        count_q = select(func.count(EventAttendee.id)).where(
            EventAttendee.event_id == e.id, EventAttendee.status == "going"
        )
        count_result = await db.execute(count_q)
        attendee_count = count_result.scalar() or 0

        my_status = None
        if current_user:
            my_q = select(EventAttendee.status).where(
                EventAttendee.event_id == e.id, EventAttendee.user_id == current_user.id
            )
            my_result = await db.execute(my_q)
            my_status_val = my_result.scalar_one_or_none()
            my_status = my_status_val.value if my_status_val else None

        items.append(EventResponse(
            id=e.id, title=e.title, description=e.description,
            location=e.location, start_time=e.start_time, end_time=e.end_time,
            is_virtual=e.is_virtual, meeting_url=e.meeting_url,
            cover_image_url=e.cover_image_url, max_attendees=e.max_attendees,
            organizer_id=e.organizer_id,
            organizer_name=e.organizer.full_name or e.organizer.email,
            organizer_avatar=e.organizer.avatar_url,
            status=e.status, attendee_count=attendee_count,
            my_status=my_status, created_at=e.created_at, updated_at=e.updated_at,
        ))

    return {"items": items, "total": total, "skip": skip, "limit": limit}


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    body: CreateEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "mentor") and current_user.membership_tier == "free":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins, mentors, or premium members can create events")
    event = Event(
        title=body.title, description=body.description,
        location=body.location, start_time=body.start_time, end_time=body.end_time,
        is_virtual=body.is_virtual, meeting_url=body.meeting_url,
        cover_image_url=body.cover_image_url, max_attendees=body.max_attendees,
        organizer_id=current_user.id, status=body.status,
    )
    db.add(event)
    await db.flush()
    await db.refresh(event)
    return EventResponse(
        id=event.id, title=event.title, description=event.description,
        location=event.location, start_time=event.start_time, end_time=event.end_time,
        is_virtual=event.is_virtual, meeting_url=event.meeting_url,
        cover_image_url=event.cover_image_url, max_attendees=event.max_attendees,
        organizer_id=event.organizer_id,
        organizer_name=current_user.full_name or current_user.email,
        organizer_avatar=current_user.avatar_url,
        status=event.status, attendee_count=0, my_status=None,
        created_at=event.created_at, updated_at=event.updated_at,
    )


@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    result = await db.execute(
        select(Event)
        .where(Event.id == event_id)
        .options(selectinload(Event.organizer), selectinload(Event.attendees).selectinload(EventAttendee.user))
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    attendees = [
        EventAttendeeResponse(
            id=a.id, user_id=a.user_id,
            user_name=a.user.full_name or a.user.email,
            user_avatar=a.user.avatar_url,
            status=a.status, created_at=a.created_at,
        )
        for a in event.attendees
    ]

    going_count = sum(1 for a in attendees if a.status == AttendeeStatus.going)

    my_status = None
    if current_user:
        my = next((a for a in event.attendees if a.user_id == current_user.id), None)
        my_status = my.status.value if my else None

    return EventDetailResponse(
        id=event.id, title=event.title, description=event.description,
        location=event.location, start_time=event.start_time, end_time=event.end_time,
        is_virtual=event.is_virtual, meeting_url=event.meeting_url,
        cover_image_url=event.cover_image_url, max_attendees=event.max_attendees,
        organizer_id=event.organizer_id,
        organizer_name=event.organizer.full_name or event.organizer.email,
        organizer_avatar=event.organizer.avatar_url,
        status=event.status, attendee_count=going_count,
        my_status=my_status,
        created_at=event.created_at, updated_at=event.updated_at,
        attendees=attendees,
    )


@router.patch("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: uuid.UUID,
    body: UpdateEventRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Event).where(Event.id == event_id).options(selectinload(Event.organizer))
    )
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.organizer_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    event.updated_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(event)

    count_q = select(func.count(EventAttendee.id)).where(
        EventAttendee.event_id == event.id, EventAttendee.status == "going"
    )
    count_result = await db.execute(count_q)
    attendee_count = count_result.scalar() or 0

    return EventResponse(
        id=event.id, title=event.title, description=event.description,
        location=event.location, start_time=event.start_time, end_time=event.end_time,
        is_virtual=event.is_virtual, meeting_url=event.meeting_url,
        cover_image_url=event.cover_image_url, max_attendees=event.max_attendees,
        organizer_id=event.organizer_id,
        organizer_name=event.organizer.full_name or event.organizer.email,
        organizer_avatar=event.organizer.avatar_url,
        status=event.status, attendee_count=attendee_count, my_status=None,
        created_at=event.created_at, updated_at=event.updated_at,
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.organizer_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    await db.delete(event)


@router.post("/{event_id}/rsvp")
async def rsvp_event(
    event_id: uuid.UUID,
    body: RSVPRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.status != "published":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is not open for RSVP")

    if body.status == AttendeeStatus.going and event.max_attendees:
        count_q = select(func.count(EventAttendee.id)).where(
            EventAttendee.event_id == event.id, EventAttendee.status == "going"
        )
        count_result = await db.execute(count_q)
        if (count_result.scalar() or 0) >= event.max_attendees:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event is full")

    result = await db.execute(
        select(EventAttendee).where(
            EventAttendee.event_id == event_id, EventAttendee.user_id == current_user.id
        )
    )
    attendee = result.scalar_one_or_none()

    if attendee:
        attendee.status = body.status
        attendee.updated_at = datetime.now(timezone.utc)
    else:
        attendee = EventAttendee(event_id=event_id, user_id=current_user.id, status=body.status)
        db.add(attendee)

    await db.flush()
    from src.routers.activity import record_activity
    await record_activity(db, current_user.id, "event_rsvped", f"RSVPed to event '{event.title}'", target_type="event", target_id=str(event_id))
    return {"status": body.status.value}
