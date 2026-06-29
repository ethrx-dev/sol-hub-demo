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

# Optional — Resend for email notifications
RESEND_API_KEY=

# Optional — Stripe for payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Web (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional — Shapo testimonials widget
NEXT_PUBLIC_SHAPO_WIDGET_ID=

# Optional — Plausible analytics
NEXT_PUBLIC_PLAUSIBLE_URL=https://plausible.io
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

## 4. Start Services (Docker Compose)

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- MinIO (ports 9000, 9001)

After starting MinIO, create the required bucket:

```bash
# Install mc client and configure
docker exec solhub-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec solhub-minio mc mb local/solhub --ignore-exist
```

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

## Optional Integrations

### Email Notifications (Resend)

Set `RESEND_API_KEY` in `apps/api/.env`. Emails fall back to console logging when the key is empty.

### Stripe Payments

1. Create products and prices in Stripe dashboard with price IDs: `price_innovator`, `price_mentor`, `price_investor`
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`
3. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `apps/web/.env`

### Shapo Testimonials

Sign up at Shapo.io, get a widget ID, and set `NEXT_PUBLIC_SHAPO_WIDGET_ID` in `apps/web/.env`.

### Plausible Analytics

Set `NEXT_PUBLIC_PLAUSIBLE_URL` (e.g. `https://plausible.io`) and `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (your domain) in `apps/web/.env`.

---

## Access Points

| Service         | URL                        |
|-----------------|----------------------------|
| Web App         | http://localhost:3000       |
| API             | http://localhost:8000       |
| API Docs        | http://localhost:8000/docs  |
| WebSocket       | ws://localhost:8000/api/ws  |
| MinIO UI        | http://localhost:9001       |
| MinIO API       | http://localhost:9000       |

## Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Auth (JWT + refresh tokens) | Built | bcrypt hashing, rate-limited (register 5/min, login 10/min) |
| Onboarding flow | Built | Role selection, skills, sectors |
| Project CRUD + milestones | Built | Status workflow: draft → submitted → active → funded → completed |
| Matchmaking | Built | Express interest, accept/decline |
| Workspace (real-time messaging) | Built | WebSocket at `/api/ws/workspace/{project_id}` |
| Document upload | Built | MinIO/S3 storage, magic byte validation |
| Email notifications | Built | Resend (falls back to console in dev) |
| Stripe payments | Built | 4 plans, checkout, Customer Portal, webhooks |
| Community feed + posts | Built | Image upload, comments, likes |
| Groups + members | Built | Join/leave, detail pages |
| Resource library | Built | 6 curated resources with detail pages |
| Public user profiles | Built | `/users/[id]` with avatar, bio, skills |
| Admin panel | Built | Stats, users, projects, matches, pricing |
| Super admin | Built | Groups/posts/resources CRUD, user deactivation |
| Notification preferences | Built | In-app + email toggle groups |
| Profile video/avatar | Built | Upload via settings Media tab |
| Rate limiting | Built | slowapi on auth endpoints |
| Analytics | Built | Plausible script injection |
| Error boundaries | Built | Retry UI on crash |
