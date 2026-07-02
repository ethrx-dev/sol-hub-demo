import uuid
from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, func
from src.deps import DbSession, CurrentAdmin
from src.models.page import Media
from src.schemas.page import MediaResponse
from src.schemas.common import PaginatedResponse, MessageResponse
from src.utils.file_validator import validate_file, validate_file_size, generate_storage_key
from src.utils.storage import upload_file, delete_file

router = APIRouter(prefix="/api/admin/media", tags=["admin"])


@router.get("", response_model=PaginatedResponse[MediaResponse])
async def list_media(
    db: DbSession,
    current_admin: CurrentAdmin,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    mime_type: str | None = None,
):
    query = select(Media)
    count_query = select(func.count(Media.id))
    if mime_type:
        query = query.where(Media.mime_type.like(f"{mime_type}%"))
        count_query = count_query.where(Media.mime_type.like(f"{mime_type}%"))
    total = await db.scalar(count_query)
    result = await db.execute(query.order_by(Media.created_at.desc()).offset(skip).limit(limit))
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    db: DbSession,
    current_admin: CurrentAdmin,
    file: UploadFile = File(...),
    alt_text: str | None = None,
    caption: str | None = None,
):
    mime = validate_file(file)
    validate_file_size(file)
    storage_key = generate_storage_key(file, mime)
    data = await file.read()
    url = await upload_file(storage_key, data, mime)

    media = Media(
        filename=storage_key,
        original_name=file.filename or "untitled",
        mime_type=mime,
        size=len(data),
        alt_text=alt_text,
        caption=caption,
        url=url,
        uploaded_by_id=current_admin.id,
    )
    db.add(media)
    await db.flush()
    return media


@router.get("/{media_id}", response_model=MediaResponse)
async def get_media(media_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Media).where(Media.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return media


@router.patch("/{media_id}", response_model=MediaResponse)
async def update_media(
    media_id: uuid.UUID,
    body: dict,
    db: DbSession,
    current_admin: CurrentAdmin,
):
    result = await db.execute(select(Media).where(Media.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    for field in ("alt_text", "caption", "original_name"):
        if field in body:
            setattr(media, field, body[field])
    await db.flush()
    return media


@router.delete("/{media_id}", response_model=MessageResponse)
async def delete_media(media_id: uuid.UUID, db: DbSession, current_admin: CurrentAdmin):
    result = await db.execute(select(Media).where(Media.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    try:
        await delete_file(media.filename)
    except Exception:
        pass
    await db.delete(media)
    await db.flush()
    return MessageResponse(detail="Media deleted successfully")
