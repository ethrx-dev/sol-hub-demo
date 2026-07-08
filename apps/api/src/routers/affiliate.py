import secrets
import uuid

from fastapi import APIRouter, HTTPException, Request, status, Query
from sqlalchemy import select, func

from src.deps import DbSession, CurrentUser
from src.models.affiliate import AffiliateCode, AffiliateClick, AffiliateConversion
from src.schemas.affiliate import (
    AffiliateCodeCreateResponse,
    AffiliateCodeStats,
    AffiliateClickRequest,
    AffiliateConversionRequest,
)

router = APIRouter(prefix="/api/affiliate", tags=["affiliate"])


@router.post("/codes", response_model=AffiliateCodeCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_affiliate_code(db: DbSession, current_user: CurrentUser):
    existing = await db.execute(
        select(AffiliateCode).where(AffiliateCode.user_id == current_user.id, AffiliateCode.is_active == True)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Active affiliate code already exists")

    code = secrets.token_hex(8)
    affiliate = AffiliateCode(user_id=current_user.id, code=code)
    db.add(affiliate)
    await db.flush()
    return AffiliateCodeCreateResponse(
        id=str(affiliate.id),
        code=affiliate.code,
        is_active=affiliate.is_active,
        created_at=affiliate.created_at,
    )


@router.get("/codes/my", response_model=AffiliateCodeCreateResponse | None)
async def get_my_affiliate_code(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(AffiliateCode).where(AffiliateCode.user_id == current_user.id, AffiliateCode.is_active == True)
    )
    code = result.scalar_one_or_none()
    if not code:
        return None
    return AffiliateCodeCreateResponse(
        id=str(code.id),
        code=code.code,
        is_active=code.is_active,
        created_at=code.created_at,
    )


@router.post("/track/click", status_code=status.HTTP_204_NO_CONTENT)
async def track_click(request: Request, body: AffiliateClickRequest, db: DbSession):
    result = await db.execute(select(AffiliateCode).where(AffiliateCode.code == body.code, AffiliateCode.is_active == True))
    affiliate = result.scalar_one_or_none()
    if not affiliate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid affiliate code")

    click = AffiliateClick(
        code_id=affiliate.id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=body.referrer,
    )
    db.add(click)
    await db.flush()


@router.post("/track/conversion", status_code=status.HTTP_204_NO_CONTENT)
async def track_conversion(body: AffiliateConversionRequest, db: DbSession):
    result = await db.execute(select(AffiliateCode).where(AffiliateCode.code == body.code, AffiliateCode.is_active == True))
    affiliate = result.scalar_one_or_none()
    if not affiliate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid affiliate code")

    conversion = AffiliateConversion(
        code_id=affiliate.id,
        referred_user_id=uuid.UUID(body.referred_user_id),
        project_id=uuid.UUID(body.project_id) if body.project_id else None,
    )
    db.add(conversion)
    affiliate.usage_count = AffiliateCode.usage_count + 1
    await db.flush()


@router.get("/codes/stats", response_model=AffiliateCodeStats)
async def get_affiliate_stats(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(AffiliateCode).where(AffiliateCode.user_id == current_user.id, AffiliateCode.is_active == True)
    )
    code = result.scalar_one_or_none()
    if not code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active affiliate code")

    click_count = await db.scalar(
        select(func.count(AffiliateClick.id)).where(AffiliateClick.code_id == code.id)
    )
    conversion_count = await db.scalar(
        select(func.count(AffiliateConversion.id)).where(AffiliateConversion.code_id == code.id)
    )
    total_clicks = click_count or 0
    total_conversions = conversion_count or 0
    conversion_rate = (total_conversions / total_clicks * 100) if total_clicks > 0 else 0.0

    return AffiliateCodeStats(
        code=code.code,
        total_clicks=total_clicks,
        total_conversions=total_conversions,
        conversion_rate=round(conversion_rate, 2),
        created_at=code.created_at,
    )
