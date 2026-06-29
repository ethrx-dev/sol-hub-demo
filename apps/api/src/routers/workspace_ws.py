import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from sqlalchemy import select

from src.database import async_session
from src.models.user import User
from src.models.project import Project
from src.models.match import Match
from src.utils.security import decode_token
from src.utils.ws_manager import manager
from src.utils.email import send_message_notification
from src.utils.notifications import create_notification
from src.models.message import Message

router = APIRouter()


@router.websocket("/api/ws/workspace/{project_id}")
async def workspace_ws(websocket: WebSocket, project_id: str, token: str = Query(...)):
    user_id = None
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    try:
        uid = uuid.UUID(user_id)
    except (ValueError, TypeError):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    async with async_session() as db:
        project = await db.execute(
            select(Project).where(Project.id == project_id, Project.is_deleted == False)
        )
        project = project.scalar_one_or_none()
        if not project:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        if project.innovator_id != uid:
            match_result = await db.execute(
                select(Match).where(
                    Match.project_id == project_id,
                    Match.status == "accepted",
                )
            )
            authorized = any(
                m.mentor_id == uid or m.investor_id == uid
                for m in match_result.scalars().all()
            )
            if not authorized:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

    await websocket.accept()

    room = f"workspace:{project_id}"

    try:
        await manager.join(room, websocket)

        while True:
            raw = await websocket.receive_text()
            import json
            msg = json.loads(raw)

            if msg.get("event") == "ping":
                await websocket.send_text(json.dumps({"event": "pong"}))
                continue

            if msg.get("event") != "message:send":
                continue

            content = msg.get("data", {}).get("content", "").strip()
            if not content:
                continue

            async with async_session() as db:
                user = await db.get(User, user_id)
                if not user:
                    continue

                project = await db.execute(
                    select(Project).where(Project.id == project_id, Project.is_deleted == False)
                )
                project = project.scalar_one_or_none()
                if not project:
                    continue

                msg_obj = Message(
                    project_id=project_id,
                    sender_id=user_id,
                    content=content,
                )
                db.add(msg_obj)
                await db.flush()

                payload = {
                    "id": str(msg_obj.id),
                    "project_id": str(project_id),
                    "sender_id": str(user_id),
                    "sender_name": user.full_name,
                    "content": content,
                    "is_read": False,
                    "created_at": msg_obj.created_at.isoformat() if msg_obj.created_at else None,
                }

                await manager.broadcast(room, "message:new", payload)

                # Notify other workspace members
                other_ids = []
                if project.innovator_id != user_id:
                    other_ids.append(project.innovator_id)
                match_result = await db.execute(
                    select(Match).where(Match.project_id == project_id, Match.status == "accepted")
                )
                for m in match_result.scalars().all():
                    for mid in [m.mentor_id, m.investor_id]:
                        if mid and mid != user_id:
                            other_ids.append(mid)

                for uid in set(other_ids):
                    await create_notification(
                        db, str(uid), "New Message",
                        f"{user.full_name} sent a message in \"{project.title}\"",
                        notification_type="message",
                    )
                    u = await db.get(User, uid)
                    if u:
                        await send_message_notification(u.email, user.full_name, project.title)

                await db.commit()

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        await manager.leave(room, websocket)
