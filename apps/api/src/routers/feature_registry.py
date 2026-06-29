from fastapi import APIRouter
from src.config import settings
from src.routers.auth import router as auth_router
from src.routers.users import router as users_router
from src.routers.projects import router as projects_router
from src.routers.matches import router as matches_router
from src.routers.milestones import router as milestones_router
from src.routers.workspace import router as workspace_router
from src.routers.investments import router as investments_router
from src.routers.feed import router as feed_router
from src.routers.groups import router as groups_router
from src.routers.members import router as members_router
from src.routers.resources import router as resources_router
from src.routers.membership import router as membership_router
from src.routers.admin import router as admin_router
from src.routers.media import router as media_router
from src.routers.workspace_ws import router as workspace_ws_router
from src.routers.notification_preferences import router as notification_preferences_router

FeatureRouter = tuple[str, APIRouter]

CORE_ROUTERS: list[FeatureRouter] = [
    ("core", auth_router),
    ("core", users_router),
    ("core", projects_router),
    ("core", matches_router),
    ("core", milestones_router),
    ("core", workspace_router),
    ("core", workspace_ws_router),
    ("core", investments_router),
    ("core", feed_router),
    ("core", groups_router),
    ("core", members_router),
    ("core", resources_router),
    ("core", membership_router),
    ("core", admin_router),
    ("core", media_router),
    ("core", notification_preferences_router),
]

FEATURE_ROUTERS: dict[str, APIRouter] = {}


def register_feature(name: str, router: APIRouter) -> None:
    FEATURE_ROUTERS[name] = router


def get_enabled_routers() -> list[APIRouter]:
    enabled = settings.features
    routers: list[APIRouter] = [r for _name, r in CORE_ROUTERS]
    for name, router in FEATURE_ROUTERS.items():
        if name in enabled:
            routers.append(router)
    return routers
