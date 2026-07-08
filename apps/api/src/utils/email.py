import asyncio
import logging
import resend

from src.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


def _render_template(body: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:24px;max-width:560px;margin:0 auto">
  <div style="text-align:center;margin-bottom:24px">
    <img src="https://spacesoflearning.com/wp-content/uploads/2023/08/cropped-sol-hub-logo-1.png" alt="SOL Hub" height="40" />
  </div>
  {body}
  <hr style="margin-top:32px;border:none;border-top:1px solid #e5e7eb" />
  <p style="font-size:12px;color:#6b7280;text-align:center">
    SOL Hub — Spaces of Learning<br />
    Nurturing dreams into successful businesses.
  </p>
</body>
</html>"""


async def send_email(to: str, subject: str, body: str) -> None:
    if settings.ENVIRONMENT == "development":
        logger.info(f"[DEV EMAIL] To: {to}, Subject: {subject}, Body: {body[:500]}...")
        return

    if not settings.RESEND_API_KEY:
        logger.error("RESEND_API_KEY not set — cannot send email")
        return

    try:
        r = await asyncio.to_thread(
            resend.Emails.send,
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": _render_template(body),
            },
        )
        logger.info(f"Email sent to {to}, id={r.get('id')}")
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")


def _app_url() -> str:
    return settings.FRONTEND_URL.rstrip("/")


async def send_verification_email(to: str, token: str) -> None:
    verify_link = f"{_app_url()}/auth/verify-email?token={token}"
    body = f"""
    <h2>Verify Your Email</h2>
    <p>Thanks for joining! Please verify your email address by clicking the button below. This link expires in 24 hours.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{verify_link}" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Verify Email
      </a>
    </div>
    <p style="color:#6b7280;font-size:14px">If you didn't create an account, you can safely ignore this email.</p>
    """
    await send_email(to, "Verify your SOL Hub email", body)


async def send_password_reset_email(to: str, token: str) -> None:
    reset_link = f"{_app_url()}/auth/reset-password?token={token}"
    body = f"""
    <h2>Password Reset Request</h2>
    <p>Click the button below to reset your password. This link expires in 1 hour.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{reset_link}" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Reset Password
      </a>
    </div>
    <p style="color:#6b7280;font-size:14px">If you didn't request this, you can safely ignore this email.</p>
    """
    await send_email(to, "Reset your SOL Hub password", body)


async def send_welcome_email(to: str, name: str, verification_token: str | None = None) -> None:
    verify_section = ""
    if verification_token:
        verify_link = f"{_app_url()}/auth/verify-email?token={verification_token}"
        verify_section = f"""
        <div style="text-align:center;margin:16px 0">
          <a href="{verify_link}" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
            Verify Your Email
          </a>
        </div>
        """
    body = f"""
    <h2>Welcome to SOL Hub, {name}!</h2>
    <p>You've joined a community of innovators, mentors, and conscious investors building the future together.</p>
    {verify_section}
    <div style="text-align:center;margin:16px 0">
      <a href="{_app_url()}/onboarding" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Complete Your Profile
      </a>
    </div>
    <p style="color:#6b7280;font-size:14px">Start by completing your profile so the community can find you.</p>
    """
    await send_email(to, f"Welcome to SOL Hub, {name}!", body)


async def send_match_notification(to: str, project_title: str, match_type: str) -> None:
    body = f"""
    <h2>New Match Interest!</h2>
    <p>A {match_type} has expressed interest in your project <strong>"{project_title}"</strong>.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{_app_url()}/hub" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        View Match
      </a>
    </div>
    """
    await send_email(to, f"New match interest for {project_title}", body)


async def send_message_notification(to: str, sender_name: str, project_title: str) -> None:
    body = f"""
    <h2>New Message</h2>
    <p><strong>{sender_name}</strong> sent a message in the workspace for <strong>"{project_title}"</strong>.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="{_app_url()}/hub" style="display:inline-block;padding:12px 24px;background-color:#729D64;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
        Open Workspace
      </a>
    </div>
    """
    await send_email(to, f"New message from {sender_name}", body)
