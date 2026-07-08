import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user
from src.models.moderation import Block, Report
from src.models.user import User
from src.schemas.moderation import (
    BlockResponse,
    CreateReportRequest,
    ReportResponse,
    UpdateReportStatusRequest,
)
from src.schemas.common import MessageResponse

router = APIRouter(prefix="/api", tags=["moderation"])


@router.post("/reports", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_report(body: CreateReportRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = Report(
        reporter_id=current_user.id,
        target_type=body.target_type,
        target_id=body.target_id,
        reason=body.reason,
        description=body.description,
    )
    db.add(report)
    await db.flush()
    return {"detail": "Report submitted successfully"}


@router.get("/reports", response_model=dict)
async def list_reports(
    status_filter: str | None = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can view reports")

    query = select(Report).options(selectinload(Report.reporter))
    count_q = select(func.count(Report.id))
    where = []
    if status_filter:
        where.append(Report.status == status_filter)
    query = query.where(*where).order_by(Report.created_at.desc())
    count_q = count_q.where(*where)

    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0
    result = await db.execute(query.offset(skip).limit(limit))
    reports = result.scalars().all()

    return {
        "items": [
            ReportResponse(
                id=r.id, reporter_id=r.reporter_id,
                reporter_name=r.reporter.full_name or r.reporter.email,
                target_type=r.target_type, target_id=r.target_id,
                reason=r.reason, description=r.description, status=r.status,
                created_at=r.created_at,
            )
            for r in reports
        ],
        "total": total, "skip": skip, "limit": limit,
    }


@router.patch("/reports/{report_id}", response_model=MessageResponse)
async def update_report_status(
    report_id: uuid.UUID,
    body: UpdateReportStatusRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update reports")
    report = await db.get(Report, report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    report.status = body.status
    await db.flush()
    return {"detail": f"Report marked as {body.status.value}"}


@router.post("/block/{user_id}", response_model=MessageResponse)
async def block_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot block yourself")
    target = await db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = await db.execute(
        select(Block).where(Block.blocker_id == current_user.id, Block.blocked_id == user_id)
    )
    if existing.scalar_one_or_none():
        return {"detail": "User already blocked"}

    block = Block(blocker_id=current_user.id, blocked_id=user_id)
    db.add(block)
    await db.flush()
    return {"detail": "User blocked successfully"}


@router.delete("/block/{user_id}", response_model=MessageResponse)
async def unblock_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Block).where(Block.blocker_id == current_user.id, Block.blocked_id == user_id)
    )
    block = result.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not blocking this user")
    await db.delete(block)
    return {"detail": "User unblocked successfully"}


@router.get("/block/blocked", response_model=list[BlockResponse])
async def list_blocked(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Block).where(Block.blocker_id == current_user.id).options(selectinload(Block.blocked_user))
    )
    blocks = result.scalars().all()
    return [
        BlockResponse(
            id=b.id, blocked_id=b.blocked_id,
            blocked_name=b.blocked_user.full_name or b.blocked_user.email,
            blocked_avatar=b.blocked_user.avatar_url,
            created_at=b.created_at,
        )
        for b in blocks
    ]
