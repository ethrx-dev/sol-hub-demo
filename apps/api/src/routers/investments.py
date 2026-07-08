import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func

from src.deps import DbSession, CurrentUser
from src.models.investment import Investment
from src.models.project import Project
from src.models.match import Match
from src.schemas.investment import InvestmentCreateRequest, InvestmentResponse, FinancialReportResponse
from src.schemas.common import PaginatedResponse

router = APIRouter(prefix="/api/investments", tags=["investments"])


@router.post("", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
async def create_investment(body: InvestmentCreateRequest, db: DbSession, current_user: CurrentUser):
    if current_user.role != "investor":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only investors can commit funding")

    project_result = await db.execute(
        select(Project).where(Project.id == uuid.UUID(body.project_id), Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    match_result = await db.execute(
        select(Match).where(
            Match.project_id == project.id,
            Match.investor_id == current_user.id,
            Match.status == "accepted",
        )
    )
    if not match_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No accepted match with this project")

    investment = Investment(
        project_id=project.id,
        investor_id=current_user.id,
        amount=body.amount,
        notes=body.notes,
    )
    db.add(investment)

    project.raised_amount = (project.raised_amount or 0) + body.amount
    await db.flush()
    return investment


@router.get("", response_model=PaginatedResponse[InvestmentResponse])
async def list_my_investments(
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    total = await db.scalar(
        select(func.count(Investment.id)).where(Investment.investor_id == current_user.id)
    )
    result = await db.execute(
        select(Investment)
        .where(Investment.investor_id == current_user.id)
        .order_by(Investment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/{investment_id}", response_model=InvestmentResponse)
async def get_investment(investment_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Investment).where(Investment.id == investment_id)
    )
    investment = result.scalar_one_or_none()
    if not investment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investment not found")
    if investment.investor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this investment")
    return investment


@router.get("/project/{project_id}", response_model=PaginatedResponse[InvestmentResponse])
async def get_project_investments(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    project_result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.innovator_id != current_user.id and current_user.role != "admin":
        match_result = await db.execute(
            select(Match).where(
                Match.project_id == project_id,
                Match.status == "accepted",
            )
        )
        authorized = False
        for match in match_result.scalars().all():
            if match.mentor_id == current_user.id or match.investor_id == current_user.id:
                authorized = True
                break
        if not authorized:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view project investments")

    total = await db.scalar(
        select(func.count(Investment.id)).where(Investment.project_id == project_id)
    )
    result = await db.execute(
        select(Investment)
        .where(Investment.project_id == project_id)
        .order_by(Investment.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/project/{project_id}/financials", response_model=FinancialReportResponse)
async def get_project_financials(project_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    project_result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.innovator_id != current_user.id and current_user.role != "admin":
        match_result = await db.execute(
            select(Match).where(
                Match.project_id == project_id,
                Match.status == "accepted",
            )
        )
        authorized = False
        for match in match_result.scalars().all():
            if match.mentor_id == current_user.id or match.investor_id == current_user.id:
                authorized = True
                break
        if not authorized:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view financials")

    total_committed = await db.scalar(
        select(func.coalesce(func.sum(Investment.amount), 0)).where(
            Investment.project_id == project_id,
            Investment.status == "committed",
        )
    )
    total_released = await db.scalar(
        select(func.coalesce(func.sum(Investment.amount), 0)).where(
            Investment.project_id == project_id,
            Investment.status == "released",
        )
    )

    return FinancialReportResponse(
        project_id=str(project_id),
        budget_breakdown=project.budget_breakdown or {},
        total_committed=total_committed or 0.0,
        total_released=total_released or 0.0,
        variance=(total_committed or 0.0) - (project.target_amount or 0.0),
    )
