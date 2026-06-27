import logging

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, body: str) -> None:
    logger.info(f"Email placeholder - To: {to}, Subject: {subject}, Body: {body[:100]}...")


async def send_password_reset_email(to: str, token: str) -> None:
    reset_link = f"http://localhost:3000/auth/reset-password?token={token}"
    body = f"Click the link to reset your password: {reset_link}\n\nThis link expires in 1 hour."
    await send_email(to, "Password Reset Request", body)
