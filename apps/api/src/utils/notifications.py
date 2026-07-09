from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.notification import Notification
from src.models.user import User


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


async def notify_admins_new_user(db: AsyncSession, user: User):
    admins = await db.execute(
        select(User).where(or_(User.role == "admin", User.role == "super_admin"))
    )
    admins = admins.scalars().all()
    for admin in admins:
        await create_notification(
            db=db,
            user_id=str(admin.id),
            title="New Member Registration",
            message=f"{user.full_name} ({user.email}) registered as {user.role}.",
            notification_type="new_user",
        )
    from src.utils.email import send_email
    from src.config import settings
    html = (
        f"<p>A new member has registered.</p>"
        f"<p>Name: <strong>{user.full_name}</strong></p>"
        f"<p>Email: {user.email}</p>"
        f"<p>Role: {user.role}</p>"
        f"<p>Log into the admin panel to review.</p>"
    )
    await send_email(
        to=settings.NOTIFICATION_EMAIL or "love@spacesoflearning.com",
        subject=f"New Member: {user.full_name}",
        body=html,
    )


async def notify_admins_new_project(db: AsyncSession, project, innovator: User):
    admins = await db.execute(
        select(User).where(or_(User.role == "admin", User.role == "super_admin"))
    )
    admins = admins.scalars().all()
    for admin in admins:
        await create_notification(
            db=db,
            user_id=str(admin.id),
            title="New Project Submission",
            message=f"{innovator.full_name} created a new project: {project.title}.",
            notification_type="new_project",
        )
    from src.utils.email import send_email
    from src.config import settings
    html = (
        f"<p>A new project has been created.</p>"
        f"<p>Project: <strong>{project.title}</strong></p>"
        f"<p>Innovator: {innovator.full_name} ({innovator.email})</p>"
        f"<p>Log into the admin panel to review.</p>"
    )
    await send_email(
        to=settings.NOTIFICATION_EMAIL or "love@spacesoflearning.com",
        subject=f"New Project: {project.title}",
        body=html,
    )
