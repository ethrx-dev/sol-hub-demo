import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func

from src.deps import DbSession, CurrentUser
from src.models.project import Project
from src.models.milestone import Milestone
from src.models.match import Match
from src.schemas.milestone import MilestoneCreateRequest, MilestoneUpdateRequest, MilestoneResponse
from src.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter(prefix="/api/projects/{project_id}/milestones", tags=["milestones"])


async def _get_project_or_404(db: DbSession, project_id: uuid.UUID) -> Project:
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


async def _can_manage_milestones(db: DbSession, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    project = await _get_project_or_404(db, project_id)
    if project.innovator_id == user_id:
        return True
    match_result = await db.execute(
        select(Match).where(
            Match.project_id == project_id,
            Match.status == "accepted",
        )
    )
    for match in match_result.scalars().all():
        if match.mentor_id == user_id or match.investor_id == user_id:
            return True
    return False


@router.post("/", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def create_milestone(
    project_id: uuid.UUID,
    body: MilestoneCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    if not await _can_manage_milestones(db, project_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage milestones")

    milestone = Milestone(
        project_id=project_id,
        title=body.title,
        description=body.description,
        due_date=body.due_date,
        budget=body.budget,
        is_funding_trigger=body.is_funding_trigger,
    )
    db.add(milestone)
    await db.flush()
    return milestone


@router.get("/", response_model=PaginatedResponse[MilestoneResponse])
async def list_milestones(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    if not await _can_manage_milestones(db, project_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view milestones for this project")
    await _get_project_or_404(db, project_id)
    total = await db.scalar(
        select(func.count(Milestone.id)).where(Milestone.project_id == project_id)
    )
    result = await db.execute(
        select(Milestone)
        .where(Milestone.project_id == project_id)
        .order_by(Milestone.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.patch("/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(
    project_id: uuid.UUID,
    milestone_id: uuid.UUID,
    body: MilestoneUpdateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    if not await _can_manage_milestones(db, project_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage milestones")

    result = await db.execute(
        select(Milestone).where(Milestone.id == milestone_id, Milestone.project_id == project_id)
    )
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(milestone, field, value)

    await db.flush()
    return milestone


@router.delete("/{milestone_id}", response_model=MessageResponse)
async def delete_milestone(
    project_id: uuid.UUID,
    milestone_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    if not await _can_manage_milestones(db, project_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to manage milestones")

    result = await db.execute(
        select(Milestone).where(Milestone.id == milestone_id, Milestone.project_id == project_id)
    )
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")

    await db.delete(milestone)
    return {"detail": "Milestone deleted successfully"}
