from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from src.deps import DbSession, CurrentUser
from src.models.notification_preference import NotificationPreference
from src.schemas.notification_preference import NotificationPreferenceResponse, UpdateNotificationPreferenceRequest

router = APIRouter(prefix="/api/users/me/notification-preferences", tags=["notification-preferences"])


@router.get("", response_model=NotificationPreferenceResponse)
async def get_preferences(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    )
    prefs = result.scalar_one_or_none()
    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)
        await db.flush()
    return prefs


@router.patch("", response_model=NotificationPreferenceResponse)
async def update_preferences(
    body: UpdateNotificationPreferenceRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    result = await db.execute(
        select(NotificationPreference).where(NotificationPreference.user_id == current_user.id)
    )
    prefs = result.scalar_one_or_none()
    if not prefs:
        prefs = NotificationPreference(user_id=current_user.id)
        db.add(prefs)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(prefs, field, value)

    await db.flush()
    return prefs
