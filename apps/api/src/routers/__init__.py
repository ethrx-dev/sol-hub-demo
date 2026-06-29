from src.routers.feature_registry import FEATURE_ROUTERS, register_feature

from src.routers.connections import router as connections_router
from src.routers.forums import router as forums_router

register_feature("connections", connections_router)
register_feature("forums", forums_router)
