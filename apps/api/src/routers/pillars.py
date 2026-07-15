import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi import Form, UploadFile, File
from sqlalchemy import func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.models.pillar_submission import PillarSubmission
from src.models.user import User
from src.utils.notifications import create_notification
from src.deps import get_current_user

router = APIRouter(prefix="/api/pillars", tags=["pillars"])

DbSession = Annotated[AsyncSession, Depends(get_db)]

PILLAR_LABELS = {
    "innovators": "Innovators",
    "mentors": "Mentors",
    "investors": "Conscious Investors",
}


async def _notify_admins(db: AsyncSession, pillar: str, submitter_name: str | None):
    admins = await db.execute(
        select(User).where(or_(User.role == "admin", User.role == "super_admin"))
    )
    admins = admins.scalars().all()
    pillar_label = PILLAR_LABELS.get(pillar, pillar)
    submitter = submitter_name or "A new member"
    for admin in admins:
        await create_notification(
            db=db,
            user_id=str(admin.id),
            title=f"New {pillar_label} Video Submission",
            message=f"{submitter} submitted a video introduction for {pillar_label}. Review it in the admin panel.",
            notification_type="pillar_submission",
        )


async def _send_email_notification(pillar: str, submitter_id: str | None):
    from src.utils.email import send_email
    from src.config import settings
    pillar_label = PILLAR_LABELS.get(pillar, pillar)
    submitter_info = f"User ID: {submitter_id}" if submitter_id else "Anonymous user"
    html = (
        f"<p>A new video submission has been received.</p>"
        f"<p>Pillar: <strong>{pillar_label}</strong></p>"
        f"<p>{submitter_info}</p>"
        f"<p>Log into the admin panel to review.</p>"
    )
    await send_email(
        to=settings.NOTIFICATION_EMAIL or "love@spacesoflearning.com",
        subject=f"New {pillar_label} Video Submission",
        body=html,
    )


PILLAR_ROLE_MAP = {
    "innovators": "innovator",
    "mentors": "mentor",
    "investors": "investor",
}


@router.post("/submit-video")
async def submit_video(
    pillar: str = Form(...),
    video: UploadFile = File(...),
    mentor_type: str | None = Form(None),
    db: DbSession = None,
    current_user: User = Depends(get_current_user),
):
    if pillar not in ("innovators", "mentors", "investors"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pillar. Must be one of: innovators, mentors, investors",
        )

    expected_role = PILLAR_ROLE_MAP[pillar]
    if current_user.role != expected_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Only {expected_role}s can submit to the {pillar} pillar",
        )

    # Validate mentor_type if provided (only for mentors pillar)
    if mentor_type and pillar == "mentors":
        valid_types = ["psych", "prof", "coach"]
        if mentor_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid mentor_type. Must be one of: {', '.join(valid_types)}",
            )
    elif mentor_type and pillar != "mentors":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="mentor_type is only valid for mentors pillar",
        )

    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only video files are accepted",
        )

    mime = video.content_type or "video/webm"
    if mime.startswith("video/webm"):
        mime = "video/webm"
    data = await video.read()

    if len(data) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty video file",
        )

    from src.utils.storage import upload_file
    from src.config import settings

    storage_key = f"pillar-submissions/{pillar}/{uuid.uuid4()}"
    url = await upload_file(storage_key, data, mime)

    direct_url = f"{settings.S3_PUBLIC_URL}/{settings.S3_BUCKET}/{storage_key}"

    submission = PillarSubmission(
        id=str(uuid.uuid4()),
        pillar=pillar,
        mentor_type=mentor_type if pillar == "mentors" else None,
        video_size=len(data),
        user_id=current_user.id,
        storage_url=direct_url,
        storage_key=storage_key,
        created_at=datetime.utcnow(),
    )

    db.add(submission)
    await db.commit()
    await db.refresh(submission)

    await _notify_admins(db, pillar, current_user.full_name)
    await _send_email_notification(pillar, str(current_user.id))

    return {
        "id": submission.id,
        "status": "received",
        "message": "Your video submission has been received. We will follow up soon!",
    }


@router.get("/submissions")
async def list_submissions(
    pillar: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: DbSession = None,
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    query = select(PillarSubmission).options(selectinload(PillarSubmission.user)).order_by(PillarSubmission.created_at.desc())
    if pillar:
        query = query.where(PillarSubmission.pillar == pillar)

    total_q = select(func.count(PillarSubmission.id))
    if pillar:
        total_q = total_q.where(PillarSubmission.pillar == pillar)
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(skip).limit(limit))
    submissions = result.scalars().all()

    from src.utils.storage import generate_presigned_url

    items = []
    for s in submissions:
        if s.storage_key:
            url = generate_presigned_url(s.storage_key)
        else:
            url = s.storage_url
        items.append({
            "id": s.id,
            "pillar": s.pillar,
            "mentorType": s.mentor_type,
            "videoSize": s.video_size,
            "storageUrl": url,
            "userId": str(s.user_id) if s.user_id else None,
            "userName": s.user.full_name if s.user else None,
            "userEmail": s.user.email if s.user else None,
            "createdAt": s.created_at.isoformat() if s.created_at else None,
        })

    return {"items": items, "total": total}


@router.get("/stats")
async def pillar_stats(db: DbSession = None):
    result = await db.execute(
        select(PillarSubmission.pillar, func.count(PillarSubmission.id))
        .group_by(PillarSubmission.pillar)
    )
    rows = result.all()
    stats = {row[0]: row[1] for row in rows}
    return {
        "innovators": stats.get("innovators", 0),
        "mentors": stats.get("mentors", 0),
        "investors": stats.get("investors", 0),
    }
