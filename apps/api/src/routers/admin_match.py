from fastapi import APIRouter, HTTPException, status

from src.deps import DbSession, CurrentAdmin
from src.models.match_settings import MatchSettings
from src.schemas.match import MatchSettingsResponse, MatchSettingsUpdate
from sqlalchemy import select

router = APIRouter(prefix="/api/admin/match-settings", tags=["admin"])


async def _load_or_create(db: DbSession) -> MatchSettings:
    result = await db.execute(select(MatchSettings).where(MatchSettings.id == 1))
    row = result.scalar_one_or_none()
    if row is None:
        row = MatchSettings(id=1)
        db.add(row)
        await db.flush()
    return row


@router.get("", response_model=MatchSettingsResponse)
async def get_match_settings(db: DbSession, current_admin: CurrentAdmin):
    return await _load_or_create(db)


@router.put("", response_model=MatchSettingsResponse)
async def update_match_settings(
    body: MatchSettingsUpdate, db: DbSession, current_admin: CurrentAdmin
):
    # Sanity bounds: weights 0-100, threshold 0-100.
    for field, value in body.model_dump().items():
        if not (0 <= value <= 100):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field} must be between 0 and 100",
            )

    row = await _load_or_create(db)
    row.sector_weight = body.sector_weight
    row.skill_weight = body.skill_weight
    row.mentor_exact_weight = body.mentor_exact_weight
    row.mentor_partial_weight = body.mentor_partial_weight
    row.guided_weight = body.guided_weight
    row.quality_threshold = body.quality_threshold
    await db.flush()
    return row
