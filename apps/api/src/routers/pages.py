from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from src.deps import DbSession
from src.models.page import Page
from src.schemas.page import PageResponse

router = APIRouter(prefix="/api/pages", tags=["pages"])


@router.get("/{slug}", response_model=PageResponse)
async def get_page_by_slug(slug: str, db: DbSession):
    result = await db.execute(
        select(Page).where(Page.slug == slug, Page.status == "published", Page.is_deleted == False)
    )
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page
