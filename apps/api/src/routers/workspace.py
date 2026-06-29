import uuid

from fastapi import APIRouter, HTTPException, status, Query, UploadFile, File
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.project import Project
from src.models.match import Match
from src.models.document import Document
from src.models.message import Message
from src.models.user import User
from src.utils.email import send_message_notification
from src.utils.notifications import create_notification
from src.schemas.workspace import (
    DocumentResponse,
    SendMessageRequest,
    MessageResponse,
    WorkspaceResponse,
)
from src.schemas.common import MessageResponse as CommonMessageResponse
from src.schemas.common import PaginatedResponse
from src.utils.file_validator import validate_file, generate_storage_key
from src.utils.storage import upload_file

router = APIRouter(prefix="/api/projects/{project_id}/workspace", tags=["workspace"])


async def _verify_workspace_access(db: DbSession, project_id: uuid.UUID, user_id: uuid.UUID) -> Project:
    project_result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.innovator_id == user_id:
        return project

    match_result = await db.execute(
        select(Match).where(
            Match.project_id == project_id,
            Match.status == "accepted",
        )
    )
    for match in match_result.scalars().all():
        if match.mentor_id == user_id or match.investor_id == user_id:
            return project

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No access to workspace")


@router.get("/", response_model=WorkspaceResponse)
async def get_workspace(project_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    project = await _verify_workspace_access(db, project_id, current_user.id)

    docs_result = await db.execute(
        select(Document).where(
            Document.project_id == project_id,
            Document.is_deleted == False,
        ).order_by(Document.created_at.desc())
    )
    documents = docs_result.scalars().all()

    msgs_result = await db.execute(
        select(Message).where(Message.project_id == project_id).order_by(Message.created_at.asc()).limit(100)
    )
    messages = msgs_result.scalars().all()

    members = []
    innovator_result = await db.execute(select(User).where(User.id == project.innovator_id))
    innovator = innovator_result.scalar_one()
    members.append({"id": str(innovator.id), "full_name": innovator.full_name, "role": "innovator", "avatar_url": innovator.avatar_url})

    match_result = await db.execute(
        select(Match).where(Match.project_id == project_id, Match.status == "accepted")
    )
    for match in match_result.scalars().all():
        if match.mentor_id:
            u = await db.get(User, match.mentor_id)
            if u:
                members.append({"id": str(u.id), "full_name": u.full_name, "role": "mentor", "avatar_url": u.avatar_url})
        if match.investor_id:
            u = await db.get(User, match.investor_id)
            if u:
                members.append({"id": str(u.id), "full_name": u.full_name, "role": "investor", "avatar_url": u.avatar_url})

    return WorkspaceResponse(
        project={"id": str(project.id), "title": project.title},
        documents=[DocumentResponse.model_validate(d) for d in documents],
        messages=[MessageResponse.model_validate(m) for m in messages],
        members=members,
    )


@router.post("/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    category: str | None = Query(None),
    db: DbSession = None,
    current_user: CurrentUser = None,
):
    await _verify_workspace_access(db, project_id, current_user.id)
    mime = validate_file(file)
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


@router.get("/documents", response_model=PaginatedResponse[DocumentResponse])
async def list_documents(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    await _verify_workspace_access(db, project_id, current_user.id)
    total = await db.scalar(
        select(func.count(Document.id)).where(
            Document.project_id == project_id,
            Document.is_deleted == False,
        )
    )
    result = await db.execute(
        select(Document)
        .where(Document.project_id == project_id, Document.is_deleted == False)
        .order_by(Document.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.delete("/documents/{document_id}", response_model=CommonMessageResponse)
async def delete_document(
    project_id: uuid.UUID,
    document_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    await _verify_workspace_access(db, project_id, current_user.id)
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.project_id == project_id,
            Document.is_deleted == False,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if doc.uploader_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this document")

    doc.is_deleted = True
    await db.flush()
    return {"detail": "Document deleted successfully"}


@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    project_id: uuid.UUID,
    body: SendMessageRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    await _verify_workspace_access(db, project_id, current_user.id)
    message = Message(
        project_id=project_id,
        sender_id=current_user.id,
        content=body.content,
    )
    db.add(message)
    await db.flush()

    # Notify other workspace members
    project_result = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = project_result.scalar_one_or_none()
    if project:
        other_members = []
        if project.innovator_id != current_user.id:
            other_members.append(project.innovator_id)
        match_result = await db.execute(
            select(Match).where(Match.project_id == project_id, Match.status == "accepted")
        )
        for m in match_result.scalars().all():
            for mid in [m.mentor_id, m.investor_id]:
                if mid and mid != current_user.id:
                    other_members.append(mid)

        for uid in set(other_members):
            await create_notification(
                db, str(uid), "New Message",
                f"{current_user.full_name} sent a message in \"{project.title}\"",
                notification_type="message",
            )
            u = await db.get(User, uid)
            if u:
                await send_message_notification(u.email, current_user.full_name, project.title)

    return MessageResponse(
        id=str(message.id),
        project_id=str(message.project_id),
        sender_id=str(message.sender_id),
        sender_name=current_user.full_name,
        content=message.content,
        is_read=message.is_read,
        created_at=message.created_at,
    )


@router.get("/messages", response_model=PaginatedResponse[MessageResponse])
async def get_messages(
    project_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    await _verify_workspace_access(db, project_id, current_user.id)
    total = await db.scalar(
        select(func.count(Message.id)).where(Message.project_id == project_id)
    )
    result = await db.execute(
        select(Message, User.full_name)
        .join(User, Message.sender_id == User.id)
        .where(Message.project_id == project_id)
        .order_by(Message.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()
    items = []
    for msg, sender_name in rows:
        items.append(MessageResponse(
            id=str(msg.id),
            project_id=str(msg.project_id),
            sender_id=str(msg.sender_id),
            sender_name=sender_name,
            content=msg.content,
            is_read=msg.is_read,
            created_at=msg.created_at,
        ))
    return PaginatedResponse(items=items[::-1], total=total or 0, skip=skip, limit=limit)
