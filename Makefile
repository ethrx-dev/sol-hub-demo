.PHONY: dev build test clean

# Development
dev:
	docker compose -f docker/docker-compose.yml up -d postgres redis minio
	cd apps/api && uvicorn src.main:app --reload --port 8000 &
	cd apps/web && pnpm dev &
	wait

dev-db:
	docker compose -f docker/docker-compose.yml up -d postgres redis minio

dev-api:
	cd apps/api && uvicorn src.main:app --reload --port 8000

dev-web:
	cd apps/web && pnpm dev

migrate:
	cd apps/api && alembic upgrade head

migrate-new:
	cd apps/api && alembic revision --autogenerate -m "$(name)"

test:
	cd apps/api && pytest

lint:
	pnpm lint

typecheck:
	pnpm typecheck

build:
	pnpm build

clean:
	pnpm clean
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .next -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name dist -exec rm -rf {} + 2>/dev/null || true
