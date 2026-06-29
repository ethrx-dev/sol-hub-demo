from src.routers.feature_registry import FEATURE_ROUTERS, register_feature

from src.routers.connections import router as connections_router

register_feature("connections", connections_router)
