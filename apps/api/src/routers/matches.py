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


@router.get("", response_model=PaginatedResponse[MatchResponse])
async def list_my_matches(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Match).where(
        or_(
            Match.mentor_id == current_user.id,
            Match.investor_id == current_user.id,
            Match.project_id.in_(
                select(Project.id).where(Project.innovator_id == current_user.id, Project.is_deleted == False)
            ),
        )
    )
    count_query = select(func.count(Match.id)).where(
        or_(
            Match.mentor_id == current_user.id,
            Match.investor_id == current_user.id,
            Match.project_id.in_(
                select(Project.id).where(Project.innovator_id == current_user.id, Project.is_deleted == False)
            ),
        )
    )

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(Match.created_at.desc()).offset(skip).limit(limit)
    )
    matches = result.scalars().all()

    items = []
    for match in matches:
        project = await db.get(Project, match.project_id)
        project_title = project.title if project else None

        matched_user = None
        if match.mentor_id and match.mentor_id != current_user.id:
            matched_user = await db.get(User, match.mentor_id)
        elif match.investor_id and match.investor_id != current_user.id:
            matched_user = await db.get(User, match.investor_id)
        elif match.mentor_id:
            matched_user = await db.get(User, match.mentor_id)
        elif match.investor_id:
            matched_user = await db.get(User, match.investor_id)

        items.append(MatchResponse(
            id=str(match.id),
            project_id=str(match.project_id),
            project_title=project_title,
            mentor_id=str(match.mentor_id) if match.mentor_id else None,
            investor_id=str(match.investor_id) if match.investor_id else None,
            matched_user_name=matched_user.full_name if matched_user else None,
            matched_user_avatar=matched_user.avatar_url if matched_user else None,
            matched_user_role=matched_user.role if matched_user else None,
            status=match.status.value if hasattr(match.status, 'value') else match.status,
            notes=match.notes,
            created_at=match.created_at,
            updated_at=match.updated_at,
        ))

    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("", response_model=MatchResponse, status_code=status.HTTP_201_CREATED)
async def create_match(body: MatchCreateRequest, db: DbSession, current_user: CurrentUser):
    project_result = await db.execute(
        select(Project).where(Project.id == uuid.UUID(body.project_id), Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    mentor_id = uuid.UUID(body.mentor_id) if body.mentor_id else None
    investor_id = uuid.UUID(body.investor_id) if body.investor_id else None

    if current_user.role == "admin":
        pass  # admins can create any match
    elif current_user.role == "innovator":
        if mentor_id != current_user.id and investor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Innovators can only express interest for themselves")
    elif current_user.role == "mentor":
        if mentor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mentors can only create matches for themselves as mentor")
    elif current_user.role == "investor":
        if investor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Investors can only create matches for themselves as investor")

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

    matched_user = None
    if mentor_id and mentor_id != current_user.id:
        matched_user = await db.get(User, mentor_id)
    elif investor_id and investor_id != current_user.id:
        matched_user = await db.get(User, investor_id)
    elif mentor_id:
        matched_user = await db.get(User, mentor_id)
    elif investor_id:
        matched_user = await db.get(User, investor_id)

    return MatchResponse(
        id=str(match.id),
        project_id=str(match.project_id),
        project_title=project.title,
        mentor_id=str(match.mentor_id) if match.mentor_id else None,
        investor_id=str(match.investor_id) if match.investor_id else None,
        matched_user_name=matched_user.full_name if matched_user else None,
        matched_user_avatar=matched_user.avatar_url if matched_user else None,
        matched_user_role=matched_user.role if matched_user else None,
        status=match.status.value if hasattr(match.status, 'value') else match.status,
        notes=match.notes,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


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

    project = await db.get(Project, match.project_id)
    project_title = project.title if project else None

    matched_user = None
    if match.mentor_id and match.mentor_id != current_user.id:
        matched_user = await db.get(User, match.mentor_id)
    elif match.investor_id and match.investor_id != current_user.id:
        matched_user = await db.get(User, match.investor_id)
    elif match.mentor_id:
        matched_user = await db.get(User, match.mentor_id)
    elif match.investor_id:
        matched_user = await db.get(User, match.investor_id)

    return MatchResponse(
        id=str(match.id),
        project_id=str(match.project_id),
        project_title=project_title,
        mentor_id=str(match.mentor_id) if match.mentor_id else None,
        investor_id=str(match.investor_id) if match.investor_id else None,
        matched_user_name=matched_user.full_name if matched_user else None,
        matched_user_avatar=matched_user.avatar_url if matched_user else None,
        matched_user_role=matched_user.role if matched_user else None,
        status=match.status.value if hasattr(match.status, 'value') else match.status,
        notes=match.notes,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )


@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")

    if current_user.role != "admin":
        project = await db.get(Project, match.project_id)
        innovator_id = project.innovator_id if project else None
        if (
            match.mentor_id != current_user.id
            and match.investor_id != current_user.id
            and innovator_id != current_user.id
        ):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not part of this match")

    project = await db.get(Project, match.project_id)
    project_title = project.title if project else None

    matched_user = None
    if match.mentor_id and match.mentor_id != current_user.id:
        matched_user = await db.get(User, match.mentor_id)
    elif match.investor_id and match.investor_id != current_user.id:
        matched_user = await db.get(User, match.investor_id)
    elif match.mentor_id:
        matched_user = await db.get(User, match.mentor_id)
    elif match.investor_id:
        matched_user = await db.get(User, match.investor_id)

    return MatchResponse(
        id=str(match.id),
        project_id=str(match.project_id),
        project_title=project_title,
        mentor_id=str(match.mentor_id) if match.mentor_id else None,
        investor_id=str(match.investor_id) if match.investor_id else None,
        matched_user_name=matched_user.full_name if matched_user else None,
        matched_user_avatar=matched_user.avatar_url if matched_user else None,
        matched_user_role=matched_user.role if matched_user else None,
        status=match.status.value if hasattr(match.status, 'value') else match.status,
        notes=match.notes,
        created_at=match.created_at,
        updated_at=match.updated_at,
    )
