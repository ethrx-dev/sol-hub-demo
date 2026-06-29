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
from src.routers.connections import router as connections_router

routers = [
    auth_router,
    users_router,
    projects_router,
    matches_router,
    milestones_router,
    workspace_router,
    workspace_ws_router,
    investments_router,
    feed_router,
    groups_router,
    members_router,
    resources_router,
    membership_router,
    admin_router,
    media_router,
    notification_preferences_router,
    connections_router,
]
