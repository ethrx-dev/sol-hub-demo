from datetime import datetime
from pydantic import BaseModel
from .common import BaseResponseWithUUID


class InvestmentCreateRequest(BaseModel):
    project_id: str
    amount: float
    notes: str | None = None


class InvestmentResponse(BaseResponseWithUUID):
    id: str
    project_id: str
    investor_id: str
    amount: float
    status: str
    notes: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class FinancialReportResponse(BaseModel):
    project_id: str
    budget_breakdown: dict = {}
    total_committed: float = 0.0
    total_released: float = 0.0
    variance: float = 0.0
