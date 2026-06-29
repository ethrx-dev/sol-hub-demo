import uuid

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func, or_

from src.deps import DbSession, CurrentUser
from src.models.group import Group
from src.models.group_member import GroupMember
from src.models.group_message import GroupMessage
from src.models.user import User
from src.schemas.group import GroupCreateRequest, GroupUpdateRequest, GroupResponse, GroupMemberResponse
from src.schemas.group_message import GroupMessageCreateRequest, GroupMessageResponse
from src.schemas.common import MessageResponse, PaginatedResponse

router = APIRouter(prefix="/api/groups", tags=["groups"])


@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(body: GroupCreateRequest, db: DbSession, current_user: CurrentUser):
    if current_user.membership_tier == "free" and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Group creation requires a paid membership tier")
    group = Group(
        creator_id=current_user.id,
        name=body.name,
        description=body.description,
        visibility=body.visibility,
        cover_image_url=body.cover_image_url,
    )
    db.add(group)
    await db.flush()

    db.add(GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="creator",
    ))
    await db.flush()

    return GroupResponse(
        id=str(group.id),
        creator_id=str(group.creator_id),
        name=group.name,
        description=group.description,
        visibility=group.visibility,
        cover_image_url=group.cover_image_url,
        member_count=1,
        is_member=True,
        is_creator=True,
        is_deleted=group.is_deleted,
        created_at=group.created_at,
        updated_at=group.updated_at,
        members=[GroupMemberResponse(
            id=str(current_user.id),
            user_id=str(current_user.id),
            full_name=current_user.full_name,
            avatar_url=current_user.avatar_url,
            role="creator",
            created_at=group.created_at,
        )],
    )


@router.get("/", response_model=PaginatedResponse[GroupResponse])
async def list_groups(
    db: DbSession,
    current_user: CurrentUser,
    visibility: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = select(Group).where(Group.is_deleted == False)
    count_query = select(func.count(Group.id)).where(Group.is_deleted == False)

    if visibility:
        query = query.where(Group.visibility == visibility)
        count_query = count_query.where(Group.visibility == visibility)

    total = await db.scalar(count_query)
    result = await db.execute(
        query.order_by(Group.created_at.desc()).offset(skip).limit(limit)
    )
    groups = result.scalars().all()

    items = []
    for group in groups:
        member_count = await db.scalar(
            select(func.count(GroupMember.id)).where(GroupMember.group_id == group.id)
        )
        is_member = bool(await db.scalar(
            select(GroupMember.id).where(
                GroupMember.group_id == group.id, GroupMember.user_id == current_user.id
            )
        ))
        items.append(GroupResponse(
            id=str(group.id),
            creator_id=str(group.creator_id),
            name=group.name,
            description=group.description,
            visibility=group.visibility,
            cover_image_url=group.cover_image_url,
            member_count=member_count or 0,
            is_member=is_member,
            is_creator=group.creator_id == current_user.id,
            is_deleted=group.is_deleted,
            created_at=group.created_at,
            updated_at=group.updated_at,
        ))

    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Group).where(Group.id == group_id, Group.is_deleted == False)
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    members_result = await db.execute(
        select(GroupMember, User.full_name, User.avatar_url)
        .join(User, GroupMember.user_id == User.id)
        .where(GroupMember.group_id == group.id)
    )
    members = []
    for gm, full_name, avatar_url in members_result.all():
        members.append(GroupMemberResponse(
            id=str(gm.id),
            user_id=str(gm.user_id),
            full_name=full_name,
            avatar_url=avatar_url,
            role=gm.role,
            created_at=gm.created_at,
        ))

    is_member = any(m.user_id == str(current_user.id) for m in members)

    return GroupResponse(
        id=str(group.id),
        creator_id=str(group.creator_id),
        name=group.name,
        description=group.description,
        visibility=group.visibility,
        cover_image_url=group.cover_image_url,
        member_count=len(members),
        is_member=is_member,
        is_creator=group.creator_id == current_user.id,
        is_deleted=group.is_deleted,
        created_at=group.created_at,
        updated_at=group.updated_at,
        members=members,
    )


@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(group_id: uuid.UUID, body: GroupUpdateRequest, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Group).where(Group.id == group_id, Group.is_deleted == False)
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the creator or admin can update")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(group, field, value)

    await db.flush()
    return await get_group(group_id, db, current_user)


@router.delete("/{group_id}", response_model=MessageResponse)
async def delete_group(group_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Group).where(Group.id == group_id, Group.is_deleted == False)
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")
    if group.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the creator or admin can delete")

    group.is_deleted = True
    await db.flush()
    return {"detail": "Group deleted successfully"}


@router.post("/{group_id}/join", response_model=dict)
async def join_group(group_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Group).where(Group.id == group_id, Group.is_deleted == False)
    )
    group = result.scalar_one_or_none()
    if not group:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    existing = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id, GroupMember.user_id == current_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already a member")

    if group.visibility == "private":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Private groups require an invitation")

    db.add(GroupMember(
        group_id=group_id,
        user_id=current_user.id,
        role="member",
    ))
    await db.flush()
    return {"detail": "Joined group successfully"}


@router.post("/{group_id}/leave", response_model=dict)
async def leave_group(group_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(GroupMember).where(
            GroupMember.group_id == group_id, GroupMember.user_id == current_user.id
        )
    )
    membership = result.scalar_one_or_none()
    if not membership:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this group")
    if membership.role == "creator":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Creator cannot leave; delete the group instead")

    await db.delete(membership)
    return {"detail": "Left group successfully"}


@router.get("/{group_id}/messages", response_model=PaginatedResponse[GroupMessageResponse])
async def list_group_messages(
    group_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    group = await db.get(Group, group_id)
    if not group or group.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    membership = await db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group_id, GroupMember.user_id == current_user.id
        )
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this group")

    total = await db.scalar(
        select(func.count(GroupMessage.id)).where(GroupMessage.group_id == group_id)
    )
    result = await db.execute(
        select(GroupMessage, User.full_name, User.avatar_url)
        .join(User, GroupMessage.sender_id == User.id)
        .where(GroupMessage.group_id == group_id)
        .order_by(GroupMessage.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = []
    for msg, full_name, avatar_url in result.all():
        items.append(GroupMessageResponse(
            id=str(msg.id),
            group_id=str(msg.group_id),
            sender_id=str(msg.sender_id),
            sender_name=full_name,
            sender_avatar=avatar_url,
            content=msg.content,
            created_at=msg.created_at,
        ))

    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.post("/{group_id}/messages", response_model=GroupMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_group_message(
    group_id: uuid.UUID,
    body: GroupMessageCreateRequest,
    db: DbSession,
    current_user: CurrentUser,
):
    group = await db.get(Group, group_id)
    if not group or group.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    membership = await db.scalar(
        select(GroupMember).where(
            GroupMember.group_id == group_id, GroupMember.user_id == current_user.id
        )
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not a member of this group")

    msg = GroupMessage(
        group_id=group_id,
        sender_id=current_user.id,
        content=body.content,
    )
    db.add(msg)
    await db.flush()
    await db.refresh(msg)

    return GroupMessageResponse(
        id=str(msg.id),
        group_id=str(msg.group_id),
        sender_id=str(msg.sender_id),
        sender_name=current_user.full_name,
        sender_avatar=current_user.avatar_url,
        content=msg.content,
        created_at=msg.created_at,
    )


@router.delete("/{group_id}/messages/{message_id}", response_model=MessageResponse)
async def delete_group_message(
    group_id: uuid.UUID,
    message_id: uuid.UUID,
    db: DbSession,
    current_user: CurrentUser,
):
    group = await db.get(Group, group_id)
    if not group or group.is_deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

    msg = await db.get(GroupMessage, message_id)
    if not msg or msg.group_id != group_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    if msg.sender_id != current_user.id and current_user.role != "admin" and group.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own messages")

    await db.delete(msg)
    return {"detail": "Message deleted successfully"}
