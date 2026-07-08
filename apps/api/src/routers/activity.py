import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_optional_user
from src.models.activity import ActivityLog
from src.models.user import User
from src.schemas.activity import ActivityLogResponse

router = APIRouter(prefix="/api/activity", tags=["activity"])


async def record_activity(
    db: AsyncSession,
    user_id: uuid.UUID,
    activity_type: str,
    description: str,
    target_type: str | None = None,
    target_id: str | None = None,
    metadata: dict | None = None,
) -> ActivityLog:
    log = ActivityLog(
        user_id=user_id,
        activity_type=activity_type,
        description=description,
        target_type=target_type,
        target_id=target_id,
        meta_data=metadata or {},
    )
    db.add(log)
    await db.flush()
    return log


@router.get("")
async def get_activity_stream(
    limit: int = Query(30, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    query = (
        select(ActivityLog)
        .options(selectinload(ActivityLog.user))
        .order_by(ActivityLog.created_at.desc())
    )
    count_q = select(func.count(ActivityLog.id))
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0
    result = await db.execute(query.offset(skip).limit(limit))
    logs = result.scalars().all()

    return {
        "items": [
            ActivityLogResponse(
                id=log.id,
                user_id=log.user_id,
                user_name=log.user.full_name or log.user.email,
                user_avatar=log.user.avatar_url,
                activity_type=log.activity_type,
                description=log.description,
                target_type=log.target_type,
                target_id=log.target_id,
                meta_data=log.meta_data,
                created_at=log.created_at,
            )
            for log in logs
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }
