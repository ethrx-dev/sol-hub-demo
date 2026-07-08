from src.routers.feature_registry import FEATURE_ROUTERS, register_feature

from src.routers.connections import router as connections_router
from src.routers.forums import router as forums_router
from src.routers.events import router as events_router
from src.routers.galleries import router as galleries_router
from src.routers.doc_library import router as doc_library_router
from src.routers.blog import router as blog_router
from src.routers.moderation import router as moderation_router

register_feature("connections", connections_router)
register_feature("forums", forums_router)
register_feature("events", events_router)
register_feature("galleries", galleries_router)
register_feature("document_library", doc_library_router)
register_feature("blog", blog_router)
register_feature("reporting", moderation_router)
