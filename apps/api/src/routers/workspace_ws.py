import json
import uuid
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

logger = logging.getLogger(__name__)
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


async def _ws_notify_members(db, project, sender_id, sender_name):
    other_ids = []
    if project.innovator_id != sender_id:
        other_ids.append(project.innovator_id)
    match_result = await db.execute(
        select(Match).where(Match.project_id == project.id, Match.status == "accepted")
    )
    for m in match_result.scalars().all():
        for mid in [m.mentor_id, m.investor_id]:
            if mid and mid != sender_id:
                other_ids.append(mid)
    for uid in set(other_ids):
        await create_notification(
            db, str(uid), "New Message",
            f"{sender_name} sent a message in \"{project.title}\"",
            notification_type="message",
        )
        u = await db.get(User, uid)
        if u:
            await send_message_notification(u.email, sender_name, project.title)


@router.websocket("/api/ws/workspace/{project_id}")
async def workspace_ws(websocket: WebSocket, project_id: str):
    uid = None
    pid = None
    try:
        logger.warning("WS HIT project_id=%s", project_id)
        subprotocols = websocket.headers.get("sec-websocket-protocol", "")
        token = subprotocols.split(",")[0].strip() if subprotocols else None

        if not token:
            logger.warning("WS reject: no token")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        payload = decode_token(token)
        user_id = payload.get("sub")

        if not user_id:
            logger.warning("WS reject: no user_id")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        pid = uuid.UUID(project_id)
        uid = uuid.UUID(user_id)

        async with async_session() as db:
            project = await db.get(Project, pid)
            if not project or project.is_deleted:
                logger.warning("WS reject: project not found pid=%s", pid)
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            if project.innovator_id != uid:
                match_result = await db.execute(
                    select(Match).where(
                        Match.project_id == pid,
                        Match.status == "accepted",
                    )
                )
                authorized = any(
                    m.mentor_id == uid or m.investor_id == uid
                    for m in match_result.scalars().all()
                )
                if not authorized:
                    logger.warning("WS reject: unauthorized uid=%s pid=%s", uid, pid)
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

        await websocket.accept(subprotocol=token)
        logger.warning("WS connected uid=%s pid=%s subproto=%s", uid, pid, token[:20])

        room = f"workspace:{project_id}"
        await manager.join(room, websocket)

        while True:
            raw = await websocket.receive_text()
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
                user = await db.get(User, uid)
                if not user:
                    continue

                project = await db.get(Project, pid)
                if not project or project.is_deleted:
                    continue

                msg_obj = Message(
                    project_id=pid,
                    sender_id=uid,
                    content=content,
                )
                db.add(msg_obj)
                await db.flush()

                payload = {
                    "id": str(msg_obj.id),
                    "project_id": project_id,
                    "sender_id": str(uid),
                    "sender_name": user.full_name,
                    "content": content,
                    "is_read": False,
                    "created_at": msg_obj.created_at.isoformat() if msg_obj.created_at else None,
                }

                await manager.broadcast(room, "message:new", payload)
                await _ws_notify_members(db, project, uid, user.full_name)
                await db.commit()

    except WebSocketDisconnect:
        logger.warning("WS disconnected uid=%s pid=%s", uid, pid)
    except Exception:
        logger.error("WS error uid=%s pid=%s", uid, pid, exc_info=True)
    finally:
        if uid and pid:
            room = f"workspace:{project_id}"
            try:
                await manager.leave(room, websocket)
            except Exception:
                pass
