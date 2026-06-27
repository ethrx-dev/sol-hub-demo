# SOL Hub Setup Guide

## Prerequisites

- **Node.js** >= 22
- **pnpm** (install via `npm install -g pnpm`)
- **Python** >= 3.13
- **Docker** & **Docker Compose** (for services)

---

## 1. Clone and Install

```bash
git clone <repo-url> sol-hub
cd sol-hub
pnpm install
```

## 2. Python Virtual Environment

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Environment Variables

### API (`apps/api/.env`)

```env
DATABASE_URL=postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret
ADMIN_SEED_KEY=your-secure-admin-key
ENVIRONMENT=development
```

### Web (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 4. Start Services (Docker Compose)

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)

## 5. Database Migrations

```bash
cd apps/api
source .venv/bin/activate
alembic upgrade head
```

## 6. Run Dev Servers

```bash
# Terminal 1 — API
cd apps/api && source .venv/bin/activate && uvicorn src.main:app --reload --port 8000

# Terminal 2 — Web
cd apps/web && npx next dev
```

Or use the root Makefile:

```bash
make dev          # start all services + API + web
make dev-db       # start only databases
make dev-api      # start API only
make dev-web      # start web only
```

## 7. Bootstrap Admin (one-time)

```bash
curl -X POST http://localhost:8000/api/admin/seed \
  -H "X-Admin-Secret: your-secure-admin-key" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@solhub.io","password":"Admin123!","full_name":"Super Admin"}'
```

Login at http://localhost:3000 with those credentials.

---

## Access Points

| Service  | URL                        |
|----------|----------------------------|
| Web App  | http://localhost:3000       |
| API      | http://localhost:8000       |
| API Docs | http://localhost:8000/docs  |
| MinIO UI | http://localhost:9001       |
