import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_, and_
from sqlalchemy.orm import joinedload

from src.deps import DbSession, CurrentUser
from src.models.match import Match, MatchStatus
from src.models.project import Project
from src.models.user import User
from src.schemas.match import MatchCreateRequest, MatchUpdateRequest, MatchResponse
from src.schemas.common import PaginatedResponse
from src.utils.email import send_match_notification
from src.utils.notifications import create_notification
from src.utils.notifications import notify_whitney_quality_match
from src.schemas.match import MatchSuggestionResponse

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("", response_model=PaginatedResponse[MatchResponse])
async def list_my_matches(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    base_where = or_(
        Match.mentor_id == current_user.id,
        Match.investor_id == current_user.id,
        Match.project_id.in_(
            select(Project.id).where(Project.innovator_id == current_user.id, Project.is_deleted == False)
        ),
    )

    count_query = select(func.count(Match.id)).where(base_where)
    total = await db.scalar(count_query)

    result = await db.execute(
        select(Match)
        .options(
            joinedload(Match.project),
            joinedload(Match.mentor),
            joinedload(Match.investor),
        )
        .where(base_where)
        .order_by(Match.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    matches = result.unique().scalars().all()

    items = []
    for match in matches:
        project = match.project
        matched_user = None
        if match.mentor_id and match.mentor_id != current_user.id:
            matched_user = match.mentor
        elif match.investor_id and match.investor_id != current_user.id:
            matched_user = match.investor
        elif match.mentor_id:
            matched_user = match.mentor
        elif match.investor_id:
            matched_user = match.investor

        items.append(MatchResponse(
            id=str(match.id),
            project_id=str(match.project_id),
            project_title=project.title if project else None,
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
        if project.innovator_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only create matches for your own projects")
    elif current_user.role == "mentor":
        if mentor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Mentors can only create matches for themselves as mentor")
    elif current_user.role == "investor":
        if investor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Investors can only create matches for themselves as investor")

    if mentor_id:
        existing_mentor = await db.execute(
            select(Match).where(
                Match.project_id == project.id,
                Match.mentor_id == mentor_id,
                Match.status != MatchStatus.DECLINED,
            )
        )
        if existing_mentor.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This mentor already has an active or pending match with this project")
    if investor_id:
        existing_investor = await db.execute(
            select(Match).where(
                Match.project_id == project.id,
                Match.investor_id == investor_id,
                Match.status != MatchStatus.DECLINED,
            )
        )
        if existing_investor.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This investor already has an active or pending match with this project")

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

    # High-quality match alert: compute a quick compatibility score for mentor
    # matches and notify Whitney when it crosses the threshold.
    QUALITY_THRESHOLD = 70
    if mentor_id and matched_user:
        score = _quick_match_score(project, matched_user, innovator)
        mentor_type = None
        if matched_user.role_specific_data:
            mentor_type = matched_user.role_specific_data.get("mentor_type")
        if score >= QUALITY_THRESHOLD:
            await notify_whitney_quality_match(
                db=db,
                project_title=project.title,
                innovator_name=innovator.full_name if innovator else "an innovator",
                mentor_name=matched_user.full_name,
                score=score,
                mentor_type=mentor_type,
            )

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

    valid_statuses = {"accepted", "declined"}
    if body.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Status must be 'accepted' or 'declined'")

    match.status = MatchStatus(body.status)
    await db.flush()

    project = await db.get(Project, match.project_id)
    project_title = project.title if project else None

    if body.status == "accepted":
        innovator = await db.get(User, project.innovator_id) if project else None
        if innovator and innovator.id != current_user.id:
            await create_notification(
                db=db,
                user_id=str(innovator.id),
                title="Match Accepted",
                message=f"{current_user.full_name} accepted the match for {project_title}. Head to the workspace to start collaborating.",
                notification_type="match_accepted",
            )

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


@router.get("/suggestions", response_model=list[MatchSuggestionResponse])
async def get_match_suggestions(
    project_id: uuid.UUID = Query(...),
    role: str = Query("mentor", regex="^(mentor|investor)$"),
    db: DbSession = None,
    current_user: CurrentUser = None,
):
    project = await db.get(Project, project_id)
    if not project or project.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    existing_match_ids = set()
    existing_matches = await db.execute(
        select(Match).where(Match.project_id == project_id)
    )
    for m in existing_matches.scalars().all():
        if role == "mentor" and m.mentor_id:
            existing_match_ids.add(m.mentor_id)
        if role == "investor" and m.investor_id:
            existing_match_ids.add(m.investor_id)

    users_result = await db.execute(
        select(User).where(
            User.role == role,
            User.is_active == True,
            User.id != current_user.id,
            User.id.notin_(existing_match_ids) if existing_match_ids else True,
        )
    )
    users = users_result.scalars().all()

    project_sectors = set()
    if project.sector:
        project_sectors.add(project.sector.lower())
    if project.sub_sector:
        project_sectors.add(project.sub_sector.lower())

    # Get innovator's preferred mentor type from their profile
    innovator = await db.get(User, project.innovator_id)
    preferred_mentor_type = None
    if innovator and innovator.role_specific_data:
        preferred_mentor_type = innovator.role_specific_data.get("mentor_type")
    innovator_guided_answers = innovator.onboarding_responses if innovator else {}

    scored = []
    for u in users:
        score = 0
        user_sectors = {s.lower() for s in (u.sectors_of_interest or [])}
        common_sectors = project_sectors & user_sectors
        score += len(common_sectors) * 25

        user_skills = {s.lower() for s in (u.skills or [])}
        if project.sub_sector and project.sub_sector.lower() in user_skills:
            score += 20

        # Mentor-type compatibility scoring (only for mentor role)
        mentor_type = None
        if role == "mentor" and u.role_specific_data:
            mentor_type = u.role_specific_data.get("mentor_type")
            if mentor_type and preferred_mentor_type and mentor_type == preferred_mentor_type:
                score += 30  # Strong bonus for exact mentor type match
            elif mentor_type and preferred_mentor_type:
                score += 10  # Partial bonus for any mentor type when innovator has preference

        # Guided answer similarity scoring (if both have onboarding responses)
        if u.onboarding_responses and innovator_guided_answers:
            guided_score = calculate_guided_similarity(u.onboarding_responses, innovator_guided_answers)
            score += guided_score

        scored.append((u, min(score, 100), mentor_type))

    scored.sort(key=lambda x: x[1], reverse=True)

    return [
        MatchSuggestionResponse(
            user_id=str(u.id),
            full_name=u.full_name,
            avatar_url=u.avatar_url,
            bio=u.bio,
            skills=u.skills,
            sectors_of_interest=u.sectors_of_interest,
            score=s,
            mentor_type=mt,
            onboarding_responses=u.onboarding_responses if role == "mentor" else None,
        )
        for u, s, mt in scored[:20]
    ]


def calculate_guided_similarity(user_responses: dict, innovator_responses: dict) -> int:
    """Calculate similarity score between guided Q&A responses (0-25 points)."""
    if not user_responses or not innovator_responses:
        return 0

    common_keys = set(user_responses.keys()) & set(innovator_responses.keys())
    if not common_keys:
        return 0

    matches = 0
    for key in common_keys:
        user_val = str(user_responses[key]).lower().strip()
        innovator_val = str(innovator_responses[key]).lower().strip()
        if user_val and innovator_val and user_val == innovator_val:
            matches += 1

    # Max 25 points for guided answer similarity
    return min(int((matches / len(common_keys)) * 25), 25)


def _quick_match_score(project, mentor: User, innovator: User | None) -> int:
    """Compute a mentor↔project compatibility score (0-100) for Whitney alerts.

    Mirrors the factor weighting used in get_match_suggestions:
    sector overlap (25 each), skill match (20), mentor-type compatibility
    (+30 exact / +10 partial), guided-answer similarity (up to 25).
    """
    score = 0

    project_sectors = set()
    if project.sector:
        project_sectors.add(project.sector.lower())
    if project.sub_sector:
        project_sectors.add(project.sub_sector.lower())

    user_sectors = {s.lower() for s in (mentor.sectors_of_interest or [])}
    common_sectors = project_sectors & user_sectors
    score += len(common_sectors) * 25

    user_skills = {s.lower() for s in (mentor.skills or [])}
    if project.sub_sector and project.sub_sector.lower() in user_skills:
        score += 20

    mentor_type = mentor.role_specific_data.get("mentor_type") if mentor.role_specific_data else None
    preferred_type = (
        innovator.role_specific_data.get("mentor_type")
        if innovator and innovator.role_specific_data
        else None
    )
    if mentor_type and preferred_type:
        if mentor_type == preferred_type:
            score += 30
        else:
            score += 10

    if mentor.onboarding_responses and innovator and innovator.onboarding_responses:
        score += calculate_guided_similarity(mentor.onboarding_responses, innovator.onboarding_responses)

    return min(score, 100)


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
