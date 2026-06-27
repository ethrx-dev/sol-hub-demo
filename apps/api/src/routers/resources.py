import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.resource import Resource
from src.schemas.resource import ResourceCreateRequest, ResourceUpdateRequest, ResourceResponse
from src.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter(prefix="/api/resources", tags=["resources"])


@router.get("/", response_model=PaginatedResponse[ResourceResponse])
async def list_resources(
    db: DbSession,
    current_user: CurrentUser,
    sector: str | None = Query(None),
    resource_type: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Resource).where(Resource.is_deleted == False)
    count_query = select(func.count(Resource.id)).where(Resource.is_deleted == False)

    if sector:
        query = query.where(Resource.sector == sector)
        count_query = count_query.where(Resource.sector == sector)
    if resource_type:
        query = query.where(Resource.resource_type == resource_type)
        count_query = count_query.where(Resource.resource_type == resource_type)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(Resource.title.ilike(pattern), Resource.description.ilike(pattern))
        )
        count_query = count_query.where(
            or_(Resource.title.ilike(pattern), Resource.description.ilike(pattern))
        )

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(Resource.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(resource_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Resource).where(Resource.id == resource_id, Resource.is_deleted == False)
    )
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource


@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(body: ResourceCreateRequest, db: DbSession, current_user: CurrentUser):
    if current_user.role not in ("admin", "mentor"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins and mentors can create resources")

    resource = Resource(
        author_id=current_user.id,
        title=body.title,
        description=body.description,
        url=body.url,
        resource_type=body.resource_type,
        sector=body.sector,
        tags=body.tags,
    )
    db.add(resource)
    await db.flush()
    return resource


@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(resource_id: uuid.UUID, body: ResourceUpdateRequest, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Resource).where(Resource.id == resource_id, Resource.is_deleted == False)
    )
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if resource.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this resource")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(resource, field, value)

    await db.flush()
    return resource


@router.delete("/{resource_id}", response_model=MessageResponse)
async def delete_resource(resource_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Resource).where(Resource.id == resource_id, Resource.is_deleted == False)
    )
    resource = result.scalar_one_or_none()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if resource.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this resource")

    resource.is_deleted = True
    await db.flush()
    return {"detail": "Resource deleted successfully"}
