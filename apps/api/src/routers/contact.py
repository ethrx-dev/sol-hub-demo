from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from src.utils.email import send_email
from src.config import settings

router = APIRouter(prefix="/api/contact", tags=["contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("")
async def submit_contact(body: ContactRequest):
    if not body.name.strip() or not body.subject.strip() or not body.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All fields are required",
        )

    admin_body = f"""
    <h2>New Contact Form Submission</h2>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <tr><td style="padding:8px;font-weight:600;color:#374151">Name</td><td style="padding:8px">{body.name}</td></tr>
      <tr><td style="padding:8px;font-weight:600;color:#374151">Email</td><td style="padding:8px"><a href="mailto:{body.email}">{body.email}</a></td></tr>
      <tr><td style="padding:8px;font-weight:600;color:#374151">Subject</td><td style="padding:8px">{body.subject}</td></tr>
    </table>
    <h3>Message</h3>
    <p style="color:#374151;white-space:pre-wrap">{body.message}</p>
    """

    await send_email(
        to=settings.NOTIFICATION_EMAIL,
        subject=f"[Contact Form] {body.subject}",
        body=admin_body,
    )

    if settings.RESEND_API_KEY:
        confirmation_body = f"""
        <h2>Thanks for reaching out, {body.name}!</h2>
        <p>We received your message and will get back to you as soon as possible.</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" />
        <p style="font-size:14px;color:#6b7280"><strong>Your message:</strong><br/>{body.message}</p>
        """
        await send_email(
            to=body.email,
            subject=f"We received your message - SOL Hub",
            body=confirmation_body,
        )

    return {"status": "sent", "message": "Thank you! We'll get back to you soon."}
