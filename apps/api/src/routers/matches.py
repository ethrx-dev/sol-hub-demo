import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.match import Match, MatchStatus
from src.models.project import Project
from src.models.user import User
from src.schemas.match import MatchCreateRequest, MatchUpdateRequest, MatchResponse
from src.schemas.common import PaginatedResponse
from src.utils.email import send_match_notification
from src.utils.notifications import create_notification

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("/", response_model=PaginatedResponse[MatchResponse])
async def list_my_matches(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Match).where(
        or_(Match.mentor_id == current_user.id, Match.investor_id == current_user.id)
    )
    count_query = select(func.count(Match.id)).where(
        or_(Match.mentor_id == current_user.id, Match.investor_id == current_user.id)
    )

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(Match.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(body: MatchCreateRequest, db: DbSession, current_user: CurrentUser):
    project_result = await db.execute(
        select(Project).where(Project.id == uuid.UUID(body.project_id), Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    mentor_id = uuid.UUID(body.mentor_id) if body.mentor_id else None
    investor_id = uuid.UUID(body.investor_id) if body.investor_id else None

    if current_user.role == "innovator":
        if mentor_id != current_user.id and investor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Innovators can only express interest for themselves")
        existing = await db.execute(
            select(Match).where(
                Match.project_id == project.id,
                or_(
                    Match.mentor_id == mentor_id,
                    Match.investor_id == investor_id,
                ),
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Match already exists")

    match = Match(
        project_id=project.id,
        mentor_id=mentor_id,
        investor_id=investor_id,
        notes=body.notes,
    )
    db.add(match)
    await db.flush()

    innovator = await db.get(User, project.innovator_id)
    if innovator:
        match_type = "mentor" if mentor_id else "investor"
        await create_notification(
            db, str(innovator.id), "New Match Interest",
            f"A {match_type} is interested in your project \"{project.title}\"",
            notification_type="match",
        )
        await send_match_notification(innovator.email, project.title, match_type)

    return match


@router.patch("/{match_id}", response_model=MatchResponse)
async def update_match(match_id: uuid.UUID, body: MatchUpdateRequest, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if current_user.role != "admin":
        if match.mentor_id != current_user.id and match.investor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not part of this match")

    if body.status not in ("accepted", "declined"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'accepted' or 'declined'")

    match.status = MatchStatus(body.status)
    await db.flush()
    return match


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match
