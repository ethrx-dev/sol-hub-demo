import uuid

from fastapi import APIRouter, HTTPException, status, UploadFile, File, Query
from sqlalchemy import select, func, update

from src.deps import DbSession, CurrentUser
from src.models.user import User
from src.models.notification import Notification
from src.schemas.user import UpdateProfileRequest, PublicProfileResponse, NotificationResponse
from src.schemas.common import MessageResponse, PaginatedResponse
from src.utils.file_validator import validate_file, generate_storage_key, get_file_category
from src.utils.storage import upload_file

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/{user_id}", response_model=PublicProfileResponse)
async def get_public_profile(user_id: uuid.UUID, db: DbSession):
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/me", response_model=PublicProfileResponse)
async def update_profile(body: UpdateProfileRequest, db: DbSession, current_user: CurrentUser):
    if body.full_name is not None:
        current_user.full_name = body.full_name
    if body.bio is not None:
        current_user.bio = body.bio
    if body.role is not None:
        if body.role not in ("innovator", "mentor", "investor", "admin"):
            raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
        current_user.role = body.role
    if body.skills is not None:
        current_user.skills = body.skills
    if body.sectors_of_interest is not None:
        current_user.sectors_of_interest = body.sectors_of_interest
    if body.onboarding_completed is not None:
        current_user.onboarding_completed = body.onboarding_completed

    await db.flush()
    return current_user


@router.post("/me/avatar", response_model=dict)
async def upload_avatar(file: UploadFile = File(...), db: DbSession = None, current_user: CurrentUser = None):
    mime = validate_file(file)
    category = get_file_category(mime)
    if category != "image":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files are allowed for avatar")

    storage_key = generate_storage_key(file, mime)
    data = await file.read()
    url = await upload_file(storage_key, data, mime)

    current_user.avatar_url = url
    await db.flush()

    return {"url": url, "storage_key": storage_key}


@router.post("/me/video", response_model=dict)
async def upload_intro_video(file: UploadFile = File(...), db: DbSession = None, current_user: CurrentUser = None):
    mime = validate_file(file)
    category = get_file_category(mime)
    if category != "video":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only video files are allowed for intro video")

    storage_key = generate_storage_key(file, mime)
    data = await file.read()
    url = await upload_file(storage_key, data, mime)

    from src.models.profile import Profile
    profile_result = await db.execute(select(Profile).where(Profile.user_id == current_user.id))
    profile = profile_result.scalar_one_or_none()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    profile.video_submission_url = url
    await db.flush()

    return {"url": url, "storage_key": storage_key}


@router.get("/me/notifications", response_model=PaginatedResponse[NotificationResponse])
async def list_notifications(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(
        select(func.count(Notification.id)).where(Notification.user_id == current_user.id)
    )
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.patch("/me/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(notification_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id,
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.is_read = True
    await db.flush()
    return notification


@router.patch("/me/notifications/read-all", response_model=MessageResponse)
async def mark_all_read(db: DbSession, current_user: CurrentUser):
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    return {"detail": "All notifications marked as read"}
