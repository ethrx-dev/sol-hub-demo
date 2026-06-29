import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select, func, delete, or_

from src.deps import DbSession, CurrentUser
from src.models.connection import Connection
from src.models.user import User
from src.schemas.common import MessageResponse, PaginatedResponse
from src.schemas.user import PublicProfileResponse

router = APIRouter(prefix="/api/connections", tags=["connections"])


@router.post("/follow/{user_id}", response_model=MessageResponse)
async def follow_user(user_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = await db.execute(
        select(Connection).where(
            Connection.follower_id == current_user.id,
            Connection.following_id == user_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"detail": "Already following this user"}

    conn = Connection(follower_id=current_user.id, following_id=user_id)
    db.add(conn)
    await db.flush()
    return {"detail": "User followed successfully"}


@router.delete("/unfollow/{user_id}", response_model=MessageResponse)
async def unfollow_user(user_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Connection).where(
            Connection.follower_id == current_user.id,
            Connection.following_id == user_id,
        )
    )
    conn = result.scalar_one_or_none()
    if not conn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not following this user")

    await db.delete(conn)
    await db.flush()
    return {"detail": "User unfollowed successfully"}


@router.get("/following", response_model=PaginatedResponse[PublicProfileResponse])
async def get_following(db: DbSession, current_user: CurrentUser, skip: int = 0, limit: int = 50):
    total = await db.scalar(
        select(func.count(Connection.id)).where(Connection.follower_id == current_user.id)
    )
    result = await db.execute(
        select(User)
        .join(Connection, Connection.following_id == User.id)
        .where(Connection.follower_id == current_user.id)
        .order_by(Connection.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    items = [PublicProfileResponse(
        id=str(u.id),
        full_name=u.full_name,
        avatar_url=u.avatar_url,
        bio=u.bio,
        role=u.role,
        skills=u.skills or [],
        sectors_of_interest=u.sectors_of_interest or [],
        created_at=u.created_at,
    ) for u in users]
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/followers", response_model=PaginatedResponse[PublicProfileResponse])
async def get_followers(db: DbSession, current_user: CurrentUser, skip: int = 0, limit: int = 50):
    total = await db.scalar(
        select(func.count(Connection.id)).where(Connection.following_id == current_user.id)
    )
    result = await db.execute(
        select(User)
        .join(Connection, Connection.follower_id == User.id)
        .where(Connection.following_id == current_user.id)
        .order_by(Connection.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    items = [PublicProfileResponse(
        id=str(u.id),
        full_name=u.full_name,
        avatar_url=u.avatar_url,
        bio=u.bio,
        role=u.role,
        skills=u.skills or [],
        sectors_of_interest=u.sectors_of_interest or [],
        created_at=u.created_at,
    ) for u in users]
    return PaginatedResponse(items=items, total=total or 0, skip=skip, limit=limit)


@router.get("/status/{user_id}", response_model=dict)
async def get_connection_status(user_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    if user_id == current_user.id:
        return {"is_following": False, "is_follower": False}

    is_following = bool(await db.scalar(
        select(Connection.id).where(
            Connection.follower_id == current_user.id,
            Connection.following_id == user_id,
        )
    ))
    is_follower = bool(await db.scalar(
        select(Connection.id).where(
            Connection.follower_id == user_id,
            Connection.following_id == current_user.id,
        )
    ))
    return {"is_following": is_following, "is_follower": is_follower}


@router.get("/counts", response_model=dict)
async def get_connection_counts(db: DbSession, current_user: CurrentUser):
    following = await db.scalar(
        select(func.count(Connection.id)).where(Connection.follower_id == current_user.id)
    )
    followers = await db.scalar(
        select(func.count(Connection.id)).where(Connection.following_id == current_user.id)
    )
    return {"following": following or 0, "followers": followers or 0}
