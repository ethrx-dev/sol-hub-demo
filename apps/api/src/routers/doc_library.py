import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.database import get_db
from src.deps import get_current_user
from src.models.doc_library import DocCategory, DocLibraryItem
from src.models.user import User
from src.schemas.doc_library import (
    CreateDocCategoryRequest,
    CreateDocItemRequest,
    UpdateDocItemRequest,
    DocCategoryResponse,
    DocLibraryItemResponse,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/categories", response_model=list[DocCategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            DocCategory,
            func.count(DocLibraryItem.id).label("doc_count"),
        )
        .outerjoin(DocLibraryItem, DocLibraryItem.category_id == DocCategory.id)
        .group_by(DocCategory.id)
        .order_by(DocCategory.name)
    )
    rows = result.all()
    return [
        DocCategoryResponse(id=cat.id, name=cat.name, slug=cat.slug, description=cat.description, doc_count=count, created_at=cat.created_at)
        for cat, count in rows
    ]


@router.post("/categories", response_model=DocCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CreateDocCategoryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can create categories")
    cat = DocCategory(name=body.name, slug=body.slug, description=body.description)
    db.add(cat)
    await db.flush()
    await db.refresh(cat)
    return DocCategoryResponse(id=cat.id, name=cat.name, slug=cat.slug, description=cat.description, doc_count=0, created_at=cat.created_at)


@router.get("")
async def list_documents(
    search: str = Query(""),
    category_id: str | None = Query(None),
    file_type: str | None = Query(None),
    sort: str = Query("newest"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(DocLibraryItem).options(selectinload(DocLibraryItem.author), selectinload(DocLibraryItem.category))
    count_query = select(func.count(DocLibraryItem.id))

    where_clauses = [DocLibraryItem.is_deleted == False]

    if search:
        like = f"%{search}%"
        where_clauses.append(
            DocLibraryItem.title.ilike(like) | DocLibraryItem.description.ilike(like) | DocLibraryItem.tags.ilike(like)
        )
    if category_id:
        where_clauses.append(DocLibraryItem.category_id == category_id)
    if file_type:
        where_clauses.append(DocLibraryItem.file_type == file_type)

    query = query.where(*where_clauses)
    count_query = count_query.where(*where_clauses)

    if sort == "oldest":
        query = query.order_by(DocLibraryItem.created_at)
    elif sort == "popular":
        query = query.order_by(DocLibraryItem.download_count.desc(), DocLibraryItem.created_at.desc())
    else:
        query = query.order_by(DocLibraryItem.created_at.desc())

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()

    return {
        "items": [
            DocLibraryItemResponse(
                id=doc.id, title=doc.title, description=doc.description,
                file_url=doc.file_url, file_type=doc.file_type, file_size=doc.file_size,
                thumbnail_url=doc.thumbnail_url, category_id=doc.category_id,
                category_name=doc.category.name if doc.category else None,
                author_id=doc.author_id, author_name=doc.author.full_name or doc.author.email,
                author_avatar=doc.author.avatar_url, tags=doc.tags,
                download_count=doc.download_count, created_at=doc.created_at, updated_at=doc.updated_at,
            )
            for doc in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("", response_model=DocLibraryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    body: CreateDocItemRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = DocLibraryItem(
        title=body.title, description=body.description,
        file_url=body.file_url, file_type=body.file_type, file_size=body.file_size,
        thumbnail_url=body.thumbnail_url,
        category_id=uuid.UUID(body.category_id) if body.category_id else None,
        author_id=current_user.id, tags=body.tags,
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc)
    from src.routers.activity import record_activity
    await record_activity(db, current_user.id, "document_uploaded", f"Uploaded document '{doc.title}'", target_type="document", target_id=str(doc.id))
    return DocLibraryItemResponse(
        id=doc.id, title=doc.title, description=doc.description,
        file_url=doc.file_url, file_type=doc.file_type, file_size=doc.file_size,
        thumbnail_url=doc.thumbnail_url, category_id=doc.category_id,
        category_name=None, author_id=doc.author_id,
        author_name=current_user.full_name or current_user.email,
        author_avatar=current_user.avatar_url, tags=doc.tags,
        download_count=0, created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.get("/{doc_id}", response_model=DocLibraryItemResponse)
async def get_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DocLibraryItem)
        .where(DocLibraryItem.id == doc_id, DocLibraryItem.is_deleted == False)
        .options(selectinload(DocLibraryItem.author), selectinload(DocLibraryItem.category))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return DocLibraryItemResponse(
        id=doc.id, title=doc.title, description=doc.description,
        file_url=doc.file_url, file_type=doc.file_type, file_size=doc.file_size,
        thumbnail_url=doc.thumbnail_url, category_id=doc.category_id,
        category_name=doc.category.name if doc.category else None,
        author_id=doc.author_id, author_name=doc.author.full_name or doc.author.email,
        author_avatar=doc.author.avatar_url, tags=doc.tags,
        download_count=doc.download_count, created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.patch("/{doc_id}", response_model=DocLibraryItemResponse)
async def update_document(
    doc_id: uuid.UUID,
    body: UpdateDocItemRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(DocLibraryItem).where(DocLibraryItem.id == doc_id).options(selectinload(DocLibraryItem.author), selectinload(DocLibraryItem.category))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "category_id":
            setattr(doc, field, uuid.UUID(value) if value else None)
        else:
            setattr(doc, field, value)
    await db.flush()
    await db.refresh(doc)
    return DocLibraryItemResponse(
        id=doc.id, title=doc.title, description=doc.description,
        file_url=doc.file_url, file_type=doc.file_type, file_size=doc.file_size,
        thumbnail_url=doc.thumbnail_url, category_id=doc.category_id,
        category_name=doc.category.name if doc.category else None,
        author_id=doc.author_id, author_name=doc.author.full_name or doc.author.email,
        author_avatar=doc.author.avatar_url, tags=doc.tags,
        download_count=doc.download_count, created_at=doc.created_at, updated_at=doc.updated_at,
    )


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(DocLibraryItem).where(DocLibraryItem.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.author_id != current_user.id and not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    doc.is_deleted = True


@router.post("/{doc_id}/download")
async def track_download(
    doc_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(DocLibraryItem).where(DocLibraryItem.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    doc.download_count += 1
    await db.flush()
    return {"download_url": doc.file_url, "download_count": doc.download_count}
