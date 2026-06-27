from pydantic import BaseModel


class PlanResponse(BaseModel):
    tier: str
    name: str
    price: float
    description: str
    features: list[str] = []


class CheckoutRequest(BaseModel):
    price_id: str
    success_url: str
    cancel_url: str


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str
