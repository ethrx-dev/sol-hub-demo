from datetime import datetime
from pydantic import BaseModel, EmailStr
from .common import BaseResponseWithUUID


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class VerifyEmailRequest(BaseModel):
    token: str


class ResendVerificationRequest(BaseModel):
    email: EmailStr


class UserResponse(BaseResponseWithUUID):
    id: str
    email: str
    full_name: str
    avatar_url: str | None = None
    role: str
    is_super_admin: bool = False
    bio: str | None = None
    skills: list = []
    sectors_of_interest: list = []
    onboarding_completed: bool = False
    membership_tier: str = "free"
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
