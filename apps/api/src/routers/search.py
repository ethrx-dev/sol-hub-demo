from fastapi import APIRouter, Query, Depends
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.models.project import Project
from src.models.resource import Resource
from src.models.event import Event
from src.models.group import Group
from src.models.blog import BlogPost

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("")
async def global_search(
    q: str = Query("", min_length=1),
    type: str | None = Query(None),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    if not q:
        return {"results": []}

    like = f"%{q}%"
    results = []

    if type is None or type == "users":
        stmt = select(User).where(
            or_(User.full_name.ilike(like), User.email.ilike(like), User.bio.ilike(like)),
            User.is_active == True,
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for u in rows:
            results.append({
                "id": str(u.id), "type": "user", "title": u.full_name,
                "description": u.bio or u.email, "image_url": u.avatar_url,
                "url": f"/hub/members/{u.id}",
            })

    if type is None or type == "projects":
        stmt = select(Project).where(
            or_(Project.title.ilike(like), Project.description.ilike(like), Project.tagline.ilike(like)),
            Project.is_deleted == False,
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for p in rows:
            results.append({
                "id": str(p.id), "type": "project", "title": p.title,
                "description": p.tagline or (p.description or "")[:200],
                "image_url": p.cover_image_url,
                "url": f"/projects/{p.id}",
            })

    if type is None or type == "resources":
        stmt = select(Resource).where(
            or_(Resource.title.ilike(like), Resource.description.ilike(like)),
            Resource.is_deleted == False,
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for r in rows:
            results.append({
                "id": str(r.id), "type": "resource", "title": r.title,
                "description": (r.description or "")[:200],
                "image_url": None,
                "url": f"/resources",
            })

    if type is None or type == "events":
        stmt = select(Event).where(
            or_(Event.title.ilike(like), Event.description.ilike(like)),
            Event.status == "published",
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for e in rows:
            results.append({
                "id": str(e.id), "type": "event", "title": e.title,
                "description": (e.description or "")[:200],
                "image_url": e.cover_image_url,
                "url": f"/hub/events/{e.id}",
            })

    if type is None or type == "groups":
        stmt = select(Group).where(
            or_(Group.name.ilike(like), Group.description.ilike(like)),
            Group.is_deleted == False,
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for g in rows:
            results.append({
                "id": str(g.id), "type": "group", "title": g.name,
                "description": (g.description or "")[:200],
                "image_url": g.cover_image_url,
                "url": f"/hub/groups/{g.id}",
            })

    if type is None or type == "blog_posts":
        stmt = select(BlogPost).where(
            or_(BlogPost.title.ilike(like), BlogPost.content.ilike(like), BlogPost.excerpt.ilike(like)),
            BlogPost.status == "published",
        ).limit(limit)
        rows = (await db.execute(stmt)).scalars().all()
        for b in rows:
            results.append({
                "id": str(b.id), "type": "blog_post", "title": b.title,
                "description": b.excerpt or (b.content or "")[:200],
                "image_url": b.cover_image,
                "url": f"/hub/blog/{b.id}",
            })

    return {"results": results, "query": q}
