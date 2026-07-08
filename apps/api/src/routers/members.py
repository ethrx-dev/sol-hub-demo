from fastapi import APIRouter, Query
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.user import User
from src.schemas.member import MemberResponse
from src.schemas.common import PaginatedResponse

router = APIRouter(prefix="/api/members", tags=["members"])


@router.get("", response_model=PaginatedResponse[MemberResponse])
async def member_directory(
    db: DbSession,
    current_user: CurrentUser,
    search: str | None = Query(None),
    role: str | None = Query(None),
    sector: str | None = Query(None),
    skill: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(User).where(User.is_active == True)
    count_query = select(func.count(User.id)).where(User.is_active == True)

    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(User.full_name.ilike(pattern), User.bio.ilike(pattern), User.email.ilike(pattern))
        )
        count_query = count_query.where(
            or_(User.full_name.ilike(pattern), User.bio.ilike(pattern), User.email.ilike(pattern))
        )

    if sector:
        query = query.where(User.sectors_of_interest.any(sector))
        count_query = count_query.where(User.sectors_of_interest.any(sector))

    if skill:
        query = query.where(User.skills.any(skill))
        count_query = count_query.where(User.skills.any(skill))

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)
