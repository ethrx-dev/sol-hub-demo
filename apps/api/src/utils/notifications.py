from sqlalchemy.ext.asyncio import AsyncSession
from src.models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
) -> Notification:
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
    )
    db.add(notification)
    await db.flush()
    return notification
