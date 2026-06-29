import uuid

from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.user import User
from src.models.project import Project
from src.models.document import Document
from src.schemas.project import ProjectCreateRequest, ProjectUpdateRequest, ProjectResponse
from src.schemas.workspace import DocumentResponse
from src.schemas.common import MessageResponse, PaginatedResponse
from src.utils.file_validator import validate_file, validate_file_size, generate_storage_key
from src.utils.storage import upload_file

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(body: ProjectCreateRequest, db: DbSession, current_user: CurrentUser):
    if current_user.role not in ("innovator", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only innovators can create projects")
    if current_user.membership_tier == "free" and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Project creation requires a paid membership tier")

    project = Project(
        innovator_id=current_user.id,
        title=body.title,
        tagline=body.tagline,
        description=body.description,
        sector=body.sector,
        sub_sector=body.sub_sector,
        stage=body.stage,
        target_amount=body.target_amount,
        cover_image_url=body.cover_image_url,
        pitch_deck_url=body.pitch_deck_url,
        website_url=body.website_url,
        video_url=body.video_url,
        team_members=body.team_members,
        budget_breakdown=body.budget_breakdown,
    )
    db.add(project)
    await db.flush()
    return project


@router.get("/", response_model=PaginatedResponse[ProjectResponse])
async def list_projects(
    db: DbSession,
    current_user: CurrentUser,
    sector: str | None = Query(None),
    status: str | None = Query(None),
    stage: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Project).where(Project.is_deleted == False)
    count_query = select(func.count(Project.id)).where(Project.is_deleted == False)

    if sector:
        query = query.where(Project.sector == sector)
        count_query = count_query.where(Project.sector == sector)
    if status:
        query = query.where(Project.status == status)
        count_query = count_query.where(Project.status == status)
    if stage:
        query = query.where(Project.stage == stage)
        count_query = count_query.where(Project.stage == stage)
    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(Project.title.ilike(pattern), Project.description.ilike(pattern), Project.tagline.ilike(pattern))
        )
        count_query = count_query.where(
            or_(Project.title.ilike(pattern), Project.description.ilike(pattern), Project.tagline.ilike(pattern))
        )

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(Project.created_at.desc()).offset(skip).limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.status == "draft" and project.innovator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID, body: ProjectUpdateRequest, db: DbSession, current_user: CurrentUser
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.innovator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can update")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    await db.flush()
    return project


@router.post("/{project_id}/submit", response_model=ProjectResponse)
async def submit_project(project_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.innovator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can submit")

    project.status = "submitted"
    await db.flush()
    return project


@router.post("/{project_id}/attachments", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    category: str | None = Query(None),
    db: DbSession = None,
    current_user: CurrentUser = None,
):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.innovator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the project owner can add attachments")

    mime = validate_file(file)
    validate_file_size(file)
    storage_key = generate_storage_key(file, mime)
    data = await file.read()
    url = await upload_file(storage_key, data, mime)

    doc = Document(
        project_id=project_id,
        uploader_id=current_user.id,
        filename=file.filename or "unnamed",
        storage_key=storage_key,
        file_url=url,
        file_type=mime,
        file_size=len(data),
        category=category,
    )
    db.add(doc)
    await db.flush()
    return doc


@router.delete("/{project_id}", response_model=MessageResponse)
async def delete_project(project_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    if project.innovator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner or admin can delete")

    project.is_deleted = True
    await db.flush()
    return {"detail": "Project deleted successfully"}
