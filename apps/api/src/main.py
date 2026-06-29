from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from src.config import settings
from src.middleware.security import SecurityHeadersMiddleware
from src.middleware.rate_limit import add_rate_limit_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT != "development" and settings.SECRET_KEY in ("dev-secret", "change-this-to-a-random-secret", ""):
        raise RuntimeError("SECRET_KEY must be set to a strong random value in non-development environments")
    if settings.ENVIRONMENT != "development" and (settings.S3_ACCESS_KEY == "minioadmin" or settings.S3_SECRET_KEY == "minioadmin"):
        raise RuntimeError("S3 credentials must be changed from default values in non-development environments")
    yield


app = FastAPI(
    title="SOL Hub API",
    description="Private membership incubation platform connecting Innovators, Mentors, and Conscious Investors",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Admin-Secret"],
)
app.add_middleware(SecurityHeadersMiddleware)
add_rate_limit_middleware(app)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.get("/api/health")
async def healthcheck():
    return {"status": "ok", "service": "sol-hub-api"}


from src.routers.feature_registry import get_enabled_routers

routers = get_enabled_routers()

for r in routers:
    app.include_router(r)
