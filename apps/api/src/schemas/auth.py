from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from .common import BaseResponseWithUUID


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    role: str = Field(default="innovator", pattern="^(innovator|mentor|investor)$")
    membership_agreed: bool = True
    email_alerts: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


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
    membership_agreed_at: datetime | None = None
    email_alerts: bool = False
    onboarding_completed: bool = False
    membership_tier: str = "free"
    is_active: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
