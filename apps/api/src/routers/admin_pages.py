import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.deps import DbSession, CurrentAdmin
from src.models.page import Page, PageRevision, Media
from src.schemas.page import (
    PageCreateRequest,
    PageUpdateRequest,
    PageResponse,
    PageListResponse,
    MediaResponse,
    PageRevisionResponse,
)
from src.schemas.common import PaginatedResponse, MessageResponse
from src.utils.storage import delete_file

router = APIRouter(prefix="/api/admin/pages", tags=["admin"])

SEED_PAGES = [
    {
        "slug": "home",
        "title": "Home",
        "status": "published",
        "sections": [
            {"id": "hero-1", "type": "hero", "data": {"heading": "Nurture your dream into a successful business", "subtext": "SOL Hub is a private membership community where innovators, mentors, and conscious investors come together to incubate and scale impact-driven ventures."}},
            {"id": "cards-1", "type": "cards", "data": {"heading": "", "cards": [{"title": "For Innovators", "description": "Get mentorship, funding, and a supportive community to turn your idea into a thriving business.", "image": "/sol-hero-family.jpg"}, {"title": "For Mentors", "description": "Share your expertise, guide the next generation of entrepreneurs, and give back to the ecosystem.", "image": "/sol-mentors-team.jpg"}, {"title": "For Conscious Investors", "description": "Discover vetted, impact-driven startups and invest in ventures that align with your values.", "image": "/sol-investors-team.jpg"}]}},
            {"id": "text-1", "type": "text", "data": {"heading": "How It Works", "body": "<div class=\"grid gap-8 md:grid-cols-3 mt-12\"><div class=\"text-center\"><div class=\"mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary\">01</div><h3 class=\"mt-6 text-xl font-bold\">Submit Your Idea</h3><p class=\"mt-2 text-muted-foreground\">Share your project with detailed information about your vision, stage, and funding needs.</p></div><div class=\"text-center\"><div class=\"mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary\">02</div><h3 class=\"mt-6 text-xl font-bold\">Get Matched</h3><p class=\"mt-2 text-muted-foreground\">Our AI-powered platform matches you with the right mentors and investors for your venture.</p></div><div class=\"text-center\"><div class=\"mx-auto flex h-20 w-20 items-center justify-center rounded-[0_20px_0_20px] bg-primary/10 text-3xl font-bold text-primary\">03</div><h3 class=\"mt-6 text-xl font-bold\">Co-Create &amp; Grow</h3><p class=\"mt-2 text-muted-foreground\">Collaborate with your team, track milestones, and scale your business with community support.</p></div></div>"}},
            {"id": "cta-1", "type": "cta", "data": {"heading": "Our Mission", "subtext": "We believe that the most impactful businesses are built at the intersection of visionary ideas, experienced guidance, and conscious capital. SOL Hub is where that convergence happens.", "button_label": "", "button_link": ""}},
            {"id": "cta-2", "type": "cta", "data": {"heading": "Join SOL Today", "subtext": "Become part of a community that's building the future, one venture at a time.", "button_label": "Get Started Free", "button_link": "/register"}},
        ],
    },
    {
        "slug": "innovators",
        "title": "For Innovators",
        "status": "published",
        "sections": [
            {"id": "hero-innovators", "type": "hero", "data": {"heading": "For Innovators", "subtext": "Get mentorship, funding, and a supportive community to turn your idea into a thriving business."}},
        ],
    },
    {
        "slug": "mentors",
        "title": "For Mentors",
        "status": "published",
        "sections": [
            {"id": "hero-mentors", "type": "hero", "data": {"heading": "For Mentors", "subtext": "Share your expertise, guide the next generation of entrepreneurs, and give back to the ecosystem."}},
        ],
    },
    {
        "slug": "investors",
        "title": "For Investors",
        "status": "published",
        "sections": [
            {"id": "hero-investors", "type": "hero", "data": {"heading": "For Conscious Investors", "subtext": "Discover vetted, impact-driven startups and invest in ventures that align with your values."}},
        ],
    },
    {
        "slug": "about",
        "title": "About",
        "status": "published",
        "sections": [],
    },
    {
        "slug": "what-we-do",
        "title": "What We Do",
        "status": "published",
        "sections": [],
    },
]


@router.post("/seed", response_model=list[PageResponse], status_code=status.HTTP_201_CREATED)
async def seed_pages(db: DbSession, current_admin: CurrentAdmin):
    if not current_admin.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only super admins can seed pages")
    created = []
    for page_data in SEED_PAGES:
        existing = await db.execute(select(Page).where(Page.slug == page_data["slug"], Page.is_deleted == False))
        if existing.scalar_one_or_none():
            continue
        page = Page(
            slug=page_data["slug"],
            title=page_data["title"],
            status=page_data["status"],
            sections=page_data.get("sections", []),
            author_id=current_admin.id,
        )
        db.add(page)
        created.append(page)
    await db.flush()
    return created


# ── Page CRUD ──


@router.get("", response_model=PaginatedResponse[PageListResponse])
async def list_pages(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: str | None = None,
):
    query = select(Page).where(Page.is_deleted == False)
    count_query = select(func.count(Page.id)).where(Page.is_deleted == False)
    if status:
        query = query.where(Page.status == status)
        count_query = count_query.where(Page.status == status)
    total = await db.scalar(count_query)
    result = await db.execute(query.order_by(Page.updated_at.desc().nulls_last()).offset(skip).limit(limit))
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("", response_model=PageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(body: PageCreateRequest, db: DbSession, current_admin: CurrentAdmin):
    existing = await db.execute(select(Page).where(Page.slug == body.slug, Page.is_deleted == False))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A page with this slug already exists")
    page = Page(
        slug=body.slug,
        title=body.title,
        status=body.status,
        layout=body.layout,
        sections=[s.model_dump() for s in body.sections],
        seo=body.seo,
        author_id=current_admin.id,
    )
    db.add(page)
    await db.flush()
    return page


@router.get("/{page_id}", response_model=PageResponse)
async def get_page(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return page


@router.put("/{page_id}", response_model=PageResponse)
async def update_page(page_id: uuid.UUID, body: PageUpdateRequest, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    update_data = body.model_dump(exclude_unset=True)
    if "sections" in update_data and update_data["sections"] is not None:
        update_data["sections"] = [s.model_dump() if hasattr(s, "model_dump") else s for s in update_data["sections"]]
    for field, value in update_data.items():
        setattr(page, field, value)
    await db.flush()
    return page


@router.delete("/{page_id}", response_model=MessageResponse)
async def delete_page(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    page.is_deleted = True
    await db.flush()
    return MessageResponse(detail="Page deleted successfully")


# ── Sections Operations ──


@router.post("/{page_id}/sections", response_model=PageResponse)
async def add_section(page_id: uuid.UUID, body: dict, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = list(page.sections or [])
    section = {
        "id": str(uuid.uuid4()),
        "type": body.get("type", "text"),
        "data": body.get("data", {}),
    }
    sections.append(section)
    page.sections = sections
    await db.flush()
    return page


@router.put("/{page_id}/sections/{section_id}", response_model=PageResponse)
async def update_section(page_id: uuid.UUID, section_id: str, body: dict, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = list(page.sections or [])
    for s in sections:
        if s.get("id") == section_id:
            if "type" in body:
                s["type"] = body["type"]
            if "data" in body:
                s["data"] = body["data"]
            break
    else:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    page.sections = sections
    await db.flush()
    return page


@router.delete("/{page_id}/sections/{section_id}", response_model=PageResponse)
async def delete_section(page_id: uuid.UUID, section_id: str, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections = [s for s in (page.sections or []) if s.get("id") != section_id]
    if len(sections) == len(page.sections or []):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    page.sections = sections
    await db.flush()
    return page


@router.put("/{page_id}/sections/reorder", response_model=PageResponse)
async def reorder_sections(page_id: uuid.UUID, body: list[str], db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    sections_by_id = {s.get("id"): s for s in (page.sections or [])}
    reordered = []
    for sid in body:
        if sid in sections_by_id:
            reordered.append(sections_by_id[sid])
    page.sections = reordered
    await db.flush()
    return page


# ── Revisions ──


@router.get("/{page_id}/revisions", response_model=PaginatedResponse[PageRevisionResponse])
async def list_revisions(
    page_id: uuid.UUID,
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    total = await db.scalar(select(func.count(PageRevision.id)).where(PageRevision.page_id == page_id))
    result = await db.execute(
        select(PageRevision)
        .where(PageRevision.page_id == page_id)
        .order_by(PageRevision.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/{page_id}/revisions", response_model=PageRevisionResponse, status_code=status.HTTP_201_CREATED)
async def create_revision(page_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    revision = PageRevision(
        page_id=page.id,
        sections_snapshot=page.sections,
        author_id=current_admin.id,
    )
    db.add(revision)
    await db.flush()
    return revision


@router.post("/{page_id}/revisions/{revision_id}/restore", response_model=PageResponse)
async def restore_revision(page_id: uuid.UUID, revision_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Page).where(Page.id == page_id, Page.is_deleted == False))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    rev_result = await db.execute(select(PageRevision).where(PageRevision.id == revision_id, PageRevision.page_id == page_id))
    revision = rev_result.scalar_one_or_none()
    if not revision:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Revision not found")
    page.sections = revision.sections_snapshot
    await db.flush()
    return page
