from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from src.config import settings
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


async def notify_admins_new_story(db: AsyncSession, user: User, post):
    admins = await db.execute(
        select(User).where(User.role == "admin")
    )
    admins = admins.scalars().all()
    for admin in admins:
        await create_notification(
            db=db,
            user_id=str(admin.id),
            title="New Story Submission",
            message=f"{user.full_name} submitted a story for review.",
            notification_type="story_submitted",
        )
    from src.utils.email import send_email
    from src.config import settings
    html = (
        f"<p>A new story has been submitted for review.</p>"
        f"<p>Author: <strong>{user.full_name}</strong> ({user.email})</p>"
        f"<p>Log into the admin panel to review it.</p>"
    )
    await send_email(
        to=settings.NOTIFICATION_EMAIL or "love@spacesoflearning.com",
        subject=f"New Story: {user.full_name}",
        body=html,
    )


async def notify_story_approved(db: AsyncSession, user: User, post):
    await create_notification(
        db=db,
        user_id=str(user.id),
        title="Your Story Was Approved!",
        message=f"Your story has been approved. You can now access all features.",
        notification_type="story_approved",
    )
    from src.utils.email import send_email
    html = (
        f"<p>Congratulations <strong>{user.full_name}</strong>!</p>"
        f"<p>Your story has been reviewed and approved by the SOL team.</p>"
        f"<p><a href='{settings.FRONTEND_URL}/innovator/story'>View your approved story</a></p>"
    )
    await send_email(
        to=user.email,
        subject="Your SOL Story Was Approved!",
        body=html,
    )


async def notify_story_rejected(db: AsyncSession, user: User, post, notes: str | None = None):
    await create_notification(
        db=db,
        user_id=str(user.id),
        title="Your Story Needs Revision",
        message=f"Your story was reviewed with feedback. Please revise and resubmit.",
        notification_type="story_rejected",
    )
    from src.utils.email import send_email
    notes_html = f"<p><strong>Feedback:</strong> {notes}</p>" if notes else ""
    html = (
        f"<p>Hi <strong>{user.full_name}</strong>,</p>"
        f"<p>Your story has been reviewed and we'd like to see some revisions before approval.</p>"
        f"{notes_html}"
        f"<p><a href='{settings.FRONTEND_URL}/innovator/story'>Edit your story</a> and resubmit when ready.</p>"
    )
    await send_email(
        to=user.email,
        subject="Your SOL Story — Feedback Received",
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


async def notify_whitney_quality_match(
    db: AsyncSession,
    project_title: str,
    innovator_name: str,
    mentor_name: str,
    score: int,
    mentor_type: str | None = None,
) -> None:
    """Notify Whitney and other mentor coordinators when a high-quality match is created.

    Sends an in-app notification to each recipient's user record (if it exists) plus an email.
    Recipients are configured via settings.MENTOR_ALERT_EMAILS (comma-separated).
    """
    from src.config import settings
    from src.utils.email import send_email

    type_label = f" ({mentor_type})" if mentor_type else ""
    message = (
        f"{innovator_name} requested a match with {mentor_name}{type_label} "
        f"for '{project_title}' (compatibility score {score})."
    )
    html = (
        f"<p>A high-quality mentor match was created.</p>"
        f"<p>Project: <strong>{project_title}</strong></p>"
        f"<p>Innovator: {innovator_name}</p>"
        f"<p>Mentor: {mentor_name}{type_label}</p>"
        f"<p>Compatibility score: <strong>{score}</strong></p>"
    )

    recipients = [
        e.strip() for e in settings.MENTOR_ALERT_EMAILS.split(",") if e.strip()
    ]
    for email in recipients:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if user:
            await create_notification(
                db=db,
                user_id=str(user.id),
                title="High-Quality Match Created",
                message=message,
                notification_type="quality_match",
            )
        await send_email(
            to=email,
            subject=f"High-Quality Match: {mentor_name} ↔ {project_title}",
            body=html,
        )


async def notify_resonance_welcome(db: AsyncSession, user_id: str) -> None:
    """Send the new member an in-app welcome from Whitney, Resonance Steward.

    Mirrors the verbatim welcome copy used in the welcome email: the member is
    first invited to be met, before any role is named or contribution expected.
    """
    message = (
        "Welcome to Spaces of Learning. Before anything is asked of you — before "
        "any role is named, before any contribution is expected — you are first "
        "invited to be met. The Resonance Gateway exists to create the conditions "
        "where what is already true can become visible. From there, your "
        "contribution naturally comes into view. Not by qualification. Not by "
        "performance. By resonance. — Whitney, Resonance Steward"
    )
    await create_notification(
        db=db,
        user_id=str(user_id),
        title="Welcome — You Are Invited to Be Met",
        message=message,
        notification_type="resonance_welcome",
    )
