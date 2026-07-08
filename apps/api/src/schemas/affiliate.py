from datetime import datetime
from pydantic import BaseModel


class AffiliateCodeCreateResponse(BaseModel):
    id: str
    code: str
    is_active: bool
    created_at: datetime


class AffiliateCodeStats(BaseModel):
    code: str
    total_clicks: int
    total_conversions: int
    conversion_rate: float
    created_at: datetime


class AffiliateClickRequest(BaseModel):
    code: str
    referrer: str | None = None


class AffiliateConversionRequest(BaseModel):
    code: str
    referred_user_id: str
    project_id: str | None = None
