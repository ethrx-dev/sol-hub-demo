from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "dev-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "solhub"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "SOL Hub <noreply@solhub.com>"
    FRONTEND_URL: str = "http://localhost:3000"

    ENVIRONMENT: str = "development"

    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    SENTRY_DSN: str | None = None
    ADMIN_SEED_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
