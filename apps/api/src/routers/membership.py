import stripe
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import select

from src.config import settings
from src.deps import DbSession, CurrentUser, CurrentAdmin
from src.models.user import User
from src.models.subscription import Subscription
from src.schemas.membership import PlanResponse, CheckoutRequest, CheckoutResponse, PortalResponse

router = APIRouter(prefix="/api/membership", tags=["membership"])

PLANS: list[dict] = [
    {"tier": "free", "name": "Free", "price": 0.0, "description": "Basic access to SOL Hub", "features": ["Browse projects", "View resources", "Join public groups"]},
    {"tier": "innovator", "name": "Innovator", "price": 19.99, "description": "For climate innovators", "features": ["Create projects", "Apply to matches", "Access workspace"]},
    {"tier": "mentor", "name": "Mentor", "price": 29.99, "description": "For mentors and advisors", "features": ["Match with projects", "Full workspace access", "Create resources"]},
    {"tier": "investor", "name": "Investor", "price": 49.99, "description": "For investors and funders", "features": ["Match with projects", "Full workspace access", "Investment dashboard"]},
]


@router.get("/plans", response_model=list[PlanResponse])
async def get_plans():
    return [PlanResponse(**p) for p in PLANS]


@router.patch("/plans/{tier}", response_model=PlanResponse)
async def update_plan(tier: str, body: PlanResponse, _: CurrentAdmin):
    for plan in PLANS:
        if plan["tier"] == tier:
            plan.update(body.model_dump(exclude_unset=True))
            return PlanResponse(**plan)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")


def _apply_tier(user: User, tier: str, db: DbSession) -> None:
    user.membership_tier = tier
    sub = Subscription(
        user_id=user.id,
        tier=tier,
        status="active",
    )
    db.add(sub)


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(body: CheckoutRequest, db: DbSession, current_user: CurrentUser):
    tier = _tier_from_price(body.price_id)

    if not settings.STRIPE_SECRET_KEY:
        _apply_tier(current_user, tier, db)
        await db.flush()
        return CheckoutResponse(url=body.success_url)

    stripe.api_key = settings.STRIPE_SECRET_KEY

    if not current_user.stripe_customer_id:
        customer = stripe.Customer.create(
            email=current_user.email,
            metadata={"user_id": str(current_user.id)},
        )
        current_user.stripe_customer_id = customer.id
        await db.flush()

    session = stripe.checkout.Session.create(
        customer=current_user.stripe_customer_id,
        payment_method_types=["card"],
        line_items=[{"price": body.price_id, "quantity": 1}],
        mode="subscription",
        success_url=body.success_url,
        cancel_url=body.cancel_url,
        metadata={"user_id": str(current_user.id)},
    )

    return CheckoutResponse(url=session.url)


@router.get("/my-subscription")
async def get_my_subscription(db: DbSession, current_user: CurrentUser):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    sub = result.scalar_one_or_none()
    if not sub:
        return {
            "tier": current_user.membership_tier or "free",
            "status": "inactive",
            "current_period_end": None,
            "cancel_at_period_end": False,
        }
    return {
        "tier": sub.tier or current_user.membership_tier or "free",
        "status": sub.status,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "cancel_at_period_end": sub.cancel_at_period_end,
    }


@router.post("/portal", response_model=PortalResponse)
async def create_portal_session(db: DbSession, current_user: CurrentUser):
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Stripe is not configured")

    stripe.api_key = settings.STRIPE_SECRET_KEY

    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No Stripe customer found")

    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url="https://solhub.app/settings",
    )

    return PortalResponse(url=session.url)


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, db: DbSession):
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Stripe webhook not configured")

    stripe.api_key = settings.STRIPE_SECRET_KEY

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing stripe-signature header")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    event_type = event.get("type")
    data = event.get("data", {}).get("object", {})

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        customer_id = data.get("customer")
        subscription_id = data.get("subscription")
        if user_id and subscription_id:
            user_result = await db.execute(select(User).where(User.id == user_id))
            user = user_result.scalar_one_or_none()
            if user and not user.stripe_customer_id:
                user.stripe_customer_id = customer_id

            try:
                sub = stripe.Subscription.retrieve(subscription_id)
                price_id = sub.get("items", {}).get("data", [{}])[0].get("price", {}).get("id")
                status_sub = sub.get("status", "active")

                sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
                subscription = sub_result.scalar_one_or_none()
                if not subscription:
                    subscription = Subscription(user_id=user_id)
                    db.add(subscription)

                subscription.stripe_subscription_id = subscription_id
                subscription.stripe_price_id = price_id
                subscription.status = status_sub
                subscription.tier = _tier_from_price(price_id)
                if sub.get("current_period_start"):
                    import datetime
                    subscription.current_period_start = datetime.datetime.fromtimestamp(sub["current_period_start"], tz=datetime.timezone.utc)
                if sub.get("current_period_end"):
                    import datetime
                    subscription.current_period_end = datetime.datetime.fromtimestamp(sub["current_period_end"], tz=datetime.timezone.utc)

                if user:
                    user.membership_tier = subscription.tier
            except Exception:
                pass

    elif event_type == "invoice.paid":
        subscription_id = data.get("subscription")
        if subscription_id:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
            )
            subscription = sub_result.scalar_one_or_none()
            if subscription:
                subscription.status = "active"
                if data.get("period_start"):
                    import datetime
                    subscription.current_period_start = datetime.datetime.fromtimestamp(data["period_start"], tz=datetime.timezone.utc)
                if data.get("period_end"):
                    import datetime
                    subscription.current_period_end = datetime.datetime.fromtimestamp(data["period_end"], tz=datetime.timezone.utc)
                user_result = await db.execute(select(User).where(User.id == subscription.user_id))
                user = user_result.scalar_one_or_none()
                if user:
                    user.membership_tier = subscription.tier

    elif event_type == "invoice.payment_failed":
        subscription_id = data.get("subscription")
        if subscription_id:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
            )
            subscription = sub_result.scalar_one_or_none()
            if subscription:
                subscription.status = "past_due"

    elif event_type == "customer.subscription.deleted":
        subscription_id = data.get("id")
        if subscription_id:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
            )
            subscription = sub_result.scalar_one_or_none()
            if subscription:
                subscription.status = "canceled"
                subscription.tier = "free"
                user_result = await db.execute(select(User).where(User.id == subscription.user_id))
                user = user_result.scalar_one_or_none()
                if user:
                    user.membership_tier = "free"

    return JSONResponse(content={"received": True})


def _tier_from_price(price_id: str) -> str:
    mapping = {
        "price_innovator": "innovator",
        "price_mentor": "mentor",
        "price_investor": "investor",
    }
    return mapping.get(price_id, "free")
