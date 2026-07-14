# SOL Hub

A standalone **Impact Incubation Platform** connecting **Innovators**, **Mentors**, and **Conscious Investors** to incubate regenerative, purpose-driven businesses.

> Based on the Spaces of Learning (SOL) model — zero WordPress dependency. Built from scratch as a modern full-stack application.

---

## Quick Start

```bash
# Prerequisites: Node 22+, Python 3.13+, Docker, pnpm

# 1. Install JS dependencies (from repo root)
pnpm install

# 2. Install Python dependencies
cd apps/api && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ../..

# 3. Start infrastructure
docker compose -f docker/docker-compose.yml up -d postgres redis minio

# 4. Configure environment
cp apps/api/.env.example apps/api/.env   # or create manually with:
# DATABASE_URL=postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub
# SECRET_KEY=dev-secret
# ADMIN_SEED_KEY=your-secure-admin-key

# 5. Run database migrations
cd apps/api && source .venv/bin/activate && alembic upgrade head && cd ../..

# 6. Start API (terminal 1)
cd apps/api && source .venv/bin/activate && uvicorn src.main:app --reload --port 8000

# 7. Start frontend (terminal 2)
cd apps/web && npx next dev

# 8. Bootstrap super admin (one-time)
curl -X POST http://localhost:8000/api/admin/seed \
  -H "X-Admin-Secret: your-secure-admin-key" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin-acct@your-domain","password":"########","full_name":"Super Admin"}'

# 9. Open in browser
# Web:  http://localhost:3000
# API:  http://localhost:8000/docs
```

---

## Table of Contents

- [Requirements](#requirements)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Admin Panel](#admin-panel)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Security](#security)

---

## Requirements

### System
- **Node.js** 22+
- **Python** 3.13+
- **Docker** & **Docker Compose** (for PostgreSQL, Redis, MinIO)
- **pnpm** 9+ (`npm install -g pnpm`)

### Disk
- ~500MB for dependencies
- ~2GB for Docker images

---

## Project Structure

```
sol-hub/
├── apps/
│   ├── web/                        # Next.js 15 frontend (App Router)
│   │   └── src/app/
│   │       ├── (public)/           # Landing, about, pricing, blog, contact, donate
│   │       ├── (auth)/             # Login, register, forgot-password, onboarding, verify-email
│   │       ├── (dashboard)/        # Role-based dashboards (innovator, mentor, investor, admin)
│   │       ├── hub/                # Community (feed, groups, members, forums, events, galleries, blog)
│   │       └── settings/           # Profile settings, billing, avatar upload
│   │
│   ├── api/                        # FastAPI backend
│   │   └── src/
│   │       ├── models/             # 33 SQLAlchemy models
│   │       ├── schemas/            # 29 Pydantic request/response schemas
│   │       ├── routers/            # 32 route modules
│   │       └── utils/             # Security, email, file, storage, notifications
│   │
│   └── worker/                     # Celery background tasks
│
├── packages/
│   └── shared/                     # TypeScript types + Zod validators
│
├── deploy/                         # Production deployment (nginx, systemd, setup script)
├── docker/                         # Docker Compose + Dockerfiles
├── infra/terraform/                # AWS infrastructure template
├── scripts/                        # start.sh, stop.sh, backup.sh, restore.sh
├── .github/workflows/              # CI pipeline
└── docs/                           # API reference, setup guide, security audit
```

---

## Installation

### 1. Clone and enter the project

```bash
cd sol-hub
```

### 2. Install JavaScript dependencies

```bash
pnpm install
```

### 3. Install Python dependencies

The API virtual environment lives inside `apps/api/`:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

### 4. Configure environment

Create `apps/api/.env` with the following:

```env
DATABASE_URL=postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=dev-secret
ADMIN_SEED_KEY=change-this-to-a-secure-random-key
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=solhub
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
```

The web frontend reads `NEXT_PUBLIC_API_URL` from `apps/web/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

> **Security**: Never commit `.env` files. The `.gitignore` already excludes them.

---

## Database Setup

### Start Infrastructure

```bash
docker compose -f docker/docker-compose.yml up -d postgres redis minio
```

This starts:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379
- **MinIO** on port 9000 (S3 API) and 9001 (Console)

### Run Migrations

```bash
cd apps/api && source .venv/bin/activate && alembic upgrade head && cd ../..
```

### Create a New Migration (after model changes)

```bash
cd apps/api && source .venv/bin/activate
alembic revision --autogenerate -m "description_of_change"
alembic upgrade head
```

### Rollback

```bash
cd apps/api && source .venv/bin/activate && alembic downgrade -1
```

---

## Running the Application

### Development Mode (two terminals)

**Terminal 1 — API Server:**
```bash
cd apps/api
source .venv/bin/activate
uvicorn src.main:app --reload --port 8000
```
Runs on http://localhost:8000 | Docs at http://localhost:8000/docs

**Terminal 2 — Frontend:**
```bash
cd apps/web
npx next dev
```
Runs on http://localhost:3000

### Using Makefile

```bash
make dev              # Start Docker services + API + Web
make dev-db           # Start Docker services only
make dev-api          # Start API server only
make dev-web          # Start frontend only
```

### Verify Everything Works

```bash
# API health check
curl http://localhost:8000/api/health
# Expected: {"status":"ok","service":"sol-hub-api"}

# API docs
open http://localhost:8000/docs

# Frontend
open http://localhost:3000
```

---

## API Documentation

When the API server is running, interactive OpenAPI documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

All API routes are prefixed with `/api`. For example, register is at `POST /api/auth/register`.

### Quick API Tests

```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"innovator@example.com","password":"password123","full_name":"Test User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"innovator@example.com","password":"password123"}'

# Bootstrap super admin (one-time, requires ADMIN_SEED_KEY set)
curl -X POST http://localhost:8000/api/admin/seed \
  -H "X-Admin-Secret: your-secure-admin-key" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@solhub.io","password":"Admin123!","full_name":"Super Admin"}'

# Use the returned access_token for authenticated requests:
# curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me
```

### API Route Summary

| Module | Prefix | Routes |
|---|---|---|
| Auth | `/api/auth` | register, login, refresh, logout, forgot-password, reset-password, verify-email, resend-verification, me |
| Users | `/api/users` | profile update, onboarding, avatar, video, notification-preferences |
| Projects | `/api/projects` | CRUD, submit, milestones, workspace, documents, messages |
| Matches | `/api/matches` | list, create, accept/decline, detail |
| Investments | `/api/investments` | commit, list, financial report |
| Feed | `/api/feed` | posts, comments, likes |
| Posts | `/api/posts` | CRUD |
| Messages | `/api/messages` | direct messaging |
| Groups | `/api/groups` | CRUD, join, leave |
| Members | `/api/members` | directory listing |
| Resources | `/api/resources` | CRUD |
| Notifications | `/api/notifications` | list, mark read |
| Events | `/api/events` | CRUD, RSVP, list upcoming/past |
| Galleries | `/api/galleries` | albums CRUD, album media, media upload, feed-media |
| Blog | `/api/blog` | posts CRUD, categories, public listing |
| Forums | `/api/forums` | categories, threads, replies |
| Connections | `/api/connections` | follow/unfollow, list followers/following |
| Activity | `/api/activity` | timeline feed |
| Search | `/api/search` | global search across entities |
| Contact | `/api/contact` | contact form submission |
| Doc Library | `/api/doc-library` | document CRUD |
| Pillars | `/api/pillars` | video submissions (innovators, mentors, investors) |
| Pages | `/api/pages` | CMS page CRUD |
| Moderation | `/api/moderation` | report content, block users |
| Membership | `/api/membership` | plans, checkout, Stripe webhooks |
| Media | `/api/media` | upload |
| Admin | `/api/admin` | seed, stats, users, projects, matches, groups, posts, resources, media, pages, pricing, reports, blog, pillar-submissions, donations |

---

## Admin Panel

The platform includes a full admin dashboard accessible by users with `role: "admin"`.

### Setting Up the First Admin

1. Set `ADMIN_SEED_KEY` in `apps/api/.env`
2. Restart the API server
3. Send a one-time request:
   ```bash
   curl -X POST http://localhost:8000/api/admin/seed \
     -H "X-Admin-Secret: your-secure-admin-key" \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@solhub.io","password":"SecurePass123!","full_name":"Super Admin"}'
   ```
4. Login at http://localhost:3000/login with those credentials
5. You will be redirected to `/admin` dashboard

The seed endpoint is idempotent — it rejects any subsequent requests with `409 Conflict`.

### Admin Capabilities

| Frontend Page | Endpoint | What You Can Do |
|---|---|---|
| `/admin` | `GET /api/admin/stats` | View platform statistics |
| `/admin/users` | `GET /api/admin/users`, `PATCH .../role` | List all users, change roles |
| `/admin/projects` | `GET /api/admin/projects`, `PATCH .../status` | List all projects, change status |
| `/admin/matches` | `GET /api/admin/matches`, `POST /api/admin/matches` | List all matches, create matches |
| `/admin/groups` | `GET /api/admin/groups`, `DELETE .../{id}` | Manage groups (super admin) |
| `/admin/posts` | `GET /api/admin/posts`, `DELETE .../{id}` | Manage feed posts (super admin) |
| `/admin/resources` | `GET /api/admin/resources`, `DELETE .../{id}` | Manage resources (super admin) |
| `/admin/media` | `GET /api/admin/media`, `POST .../upload`, `DELETE .../{id}` | Media library upload/delete |
| `/admin/pages` | `GET /api/admin/pages`, `POST ...`, `PATCH .../{id}` | CMS page management |
| `/admin/pricing` | `GET /api/admin/pricing`, `PATCH ...` | Manage membership pricing plans |
| `/admin/blog` | `GET /api/admin/blog`, `POST ...`, `PATCH ...`, `DELETE ...` | Blog post CRUD |
| `/admin/pillar-submissions` | `GET /api/admin/pillar-submissions` | Review pillar video submissions |
| `/admin/reports` | `GET /api/admin/reports`, `PATCH .../status` | Moderate reported content |
| `/admin/donations` | `GET /api/admin/donations` | View all donations, total count + total amount |

### Super Admin

The seeded admin has `is_super_admin: true` granting full access to all management features. Super admins can:
- Promote/demote other users to super admin
- Delete (deactivate) users
- Delete groups, posts, and resources
- Access all management pages

Super admin status is indicated by an amber banner on admin pages and a `Crown` badge on the users table.

---

## Testing

### Backend Tests

```bash
cd apps/api && source .venv/bin/activate && pytest
cd apps/api && source .venv/bin/activate && pytest --cov=src --cov-report=term-missing
```

### Frontend Type Check

```bash
cd apps/web && npx tsc --noEmit
```

### Full TypeScript Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

---

## Development Guide

### Adding a New API Endpoint

1. **Pydantic schema**: Add request/response models to `apps/api/src/schemas/`
2. **Route handler**: Add function in `apps/api/src/routers/`
3. **Register router**: Update `apps/api/src/routers/__init__.py`
4. **Test**: Access at http://localhost:8000/docs

### Adding a New Database Model

1. **Model class**: Add to `apps/api/src/models/`
2. **Import**: Update `apps/api/src/models/__init__.py`
3. **Migration**: 
   ```bash
   cd apps/api && source .venv/bin/activate
   alembic revision --autogenerate -m "add_model"
   alembic upgrade head
   ```

### Adding a New Frontend Page

1. **Route folder**: Create `apps/web/src/app/<route>/page.tsx`
2. **Layout**: Use existing layouts from `components/layout/`
3. **Data fetching**: Use `lib/api-client.ts` (already configured with auth headers)
4. **State**: Use Zustand stores from `stores/`

### Code Conventions

- **Python**: Async/await throughout. Type hints on all functions. Pydantic for validation. `BaseResponseWithUUID` for schemas using `from_attributes`.
- **TypeScript**: Strict mode. Use types from `@sol-hub/shared`. Prefer interfaces over types for objects.
- **CSS**: Tailwind v4 utility classes only. No CSS modules or styled-components.
- **Components**: One component per file. Use `cn()` from `lib/utils.ts` for class merging.

---

## Deployment

### Docker Deployment

```bash
# Build and run all services
docker compose -f docker/docker-compose.yml up -d --build
```

### Production Checklist

- [ ] Generate a strong `SECRET_KEY` (`openssl rand -hex 32`)
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `CORS_ORIGINS` with your actual domain
- [ ] Set up a real PostgreSQL (RDS, Cloud SQL, etc.)
- [ ] Set up a real Redis (ElastiCache, Upstash, etc.)
- [ ] Configure S3-compatible storage (S3, R2, GCS) with strong access keys
- [ ] Verify Resend sender domain and set `RESEND_API_KEY`
- [ ] Set `EMAIL_FROM` to a verified sender in Resend
- [ ] Set `NOTIFICATION_EMAIL` to the admin contact
- [ ] Set `FRONTEND_URL` to the production domain
- [ ] Set Stripe live keys
- [ ] Set up SSL certificate (Let's Encrypt via Certbot/Nginx)
- [ ] Configure `ENABLED_FEATURES` for production
- [ ] Configure Sentry DSN for error monitoring
- [ ] Enable database backups (automated pg_dump via `scripts/backup.sh`)
- [ ] Set up monitoring (healthchecks, Uptime Kuma, etc.)

### VPS Deployment (Minimal)

```bash
git clone <repo-url> sol-hub
cd sol-hub
# Create apps/api/.env with production values
docker compose -f docker/docker-compose.yml up -d
docker compose exec api alembic upgrade head
# Seed admin: curl -X POST .../api/admin/seed ...
```

### VPS Deployment (Production — Systemd + Nginx)

The `deploy/` directory contains production-ready service files:

| File | Purpose |
|---|---|
| `deploy/nginx.conf` | Nginx reverse proxy with SSL, security headers, 50 MB upload limit |
| `deploy/solhub.service` | Meta service that starts all docker services |
| `deploy/solhub-api.service` | API service (uvicorn) |
| `deploy/solhub-web.service` | Web service (Next.js) |
| `deploy/setup.sh` | One-time setup: installs Docker, Python, Node.js, copies files, creates .env |

```bash
# One-time setup (as root):
sudo bash deploy/setup.sh

# Edit /opt/sol-hub/.env with production values, then:
systemctl start solhub

# Or use the startup script:
bash scripts/start.sh --docker       # Docker mode
bash scripts/start.sh --production   # Docker mode, no reload
```

The `scripts/` directory provides helpers:
| Script | Purpose |
|---|---|
| `scripts/start.sh` | Start all services (Docker infra + API + Web) |
| `scripts/stop.sh` | Stop all services gracefully |
| `scripts/backup.sh` | Database backup (pg_dump) |
| `scripts/restore.sh` | Restore from a backup archive |

### Cloud Deployment (AWS)

The `infra/terraform/main.tf` provides a template for:
- VPC + subnets
- RDS PostgreSQL
- ElastiCache Redis
- S3 bucket for uploads
- ECS Fargate for API + Worker
- CloudFront CDN
- Route53 + ACM SSL

---

## Architecture

### System Diagram

```
                         Cloudflare / DNS
                              │
                    ┌── Nginx/Caddy (TLS) ──┐
                    │       :443             │   SSL termination
                    └───┬───────────────┬────┘
                        │               │
                 ┌── Next.js :3000 ──┐  │
                 │  SSR/SSG pages    │  │
                 │  API rewrites     │  │
                 └──────┬────────────┘  │
                        │               │
                 ┌── FastAPI :8000 ────┐ │
                 │  Business logic     │ │
                 │  Auth + middleware  │ │
                 └──┬────┬────┬────┬───┘ │
                    │    │    │    │      │
           ┌────────┤    │    │    └──────┤
      PostgreSQL   Redis  S3/MinIO    Celery Worker
      :5432        :6379  :9000      (background)

           WebSocket: ws://.../api/ws/workspace/{id}
```

### Data Flow

```
User → Browser → Next.js (SSR) → API (FastAPI) → PostgreSQL
                                    ↕
                               Redis (cache + queue)
                                    ↕
                              Celery Worker (async tasks)
                                    ↕
                               MinIO/S3 (files)
```

---

## Security

### Authentication
- JWT access tokens (30min) + refresh tokens (7 days)
- Tokens transmitted via `Authorization: Bearer` header
- Passwords hashed with bcrypt via passlib
- Passwords require minimum 8 characters
- WebSocket tokens passed via `Sec-WebSocket-Protocol` header (not URL query params)

### API Security
- Rate limiting on auth endpoints (register 5/min, login 10/min, password reset 3-5/hour)
- CORS restricted to explicit allowlist (env-configurable)
- Security headers on all responses (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Role-based access control at the route level (`CurrentAdmin`, `CurrentInnovator`, etc.)
- Membership tier enforcement on project/group creation (free users restricted)
- Draft projects hidden from non-owners (returns 404)
- Startup guards block weak `SECRET_KEY` / default S3 credentials in production

### File Uploads
- File type validated by reading magic bytes (`python-magic`), not extension
- Files renamed to UUID server-side (`generate_storage_key`)
- Stored on separate S3/MinIO domain (not app origin)
- 50 MB max file size enforced (`validate_file_size`)
- Avatar, video, project attachments, workspace documents all validated

### Email (Resend)
- All email sending wrapped in async helper (`utils/email.py`)
- Development mode: emails logged to console, never actually sent
- Production mode: sent via Resend API with HTML template
- Contact form sends admin notification + user confirmation
- Pillar submissions trigger email notifications

### Stripe Webhooks
- Signature verified on every request via `stripe.Webhook.construct_event()`
- Processed event IDs tracked for idempotency (prevents duplicate processing)
- Full lifecycle handled: checkout, invoice, subscription events, and one-time donations (`mode="payment"` via the `membership` webhook)
- Demo mode guarded by `ENVIRONMENT=development` check

### Database
- All queries use SQLAlchemy ORM (parameterized queries)
- No raw SQL
- Migrations version-controlled via Alembic

### Additional Protections
- Rate limiting on auth endpoints via slowapi
- Webhook idempotency via `WebhookEvent` model
- Super admin privileges for destructive operations (group/post/resource deletion, user deactivation)
- Strict CSP headers limit script sources
- Error handler returns generic messages (no stack traces leaked)
- `.env` excluded from git; lockfiles committed

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://solhub:solhub_dev@localhost:5432/solhub` | PostgreSQL connection string |
| `REDIS_URL` | Yes | `redis://localhost:6379/0` | Redis connection string |
| `SECRET_KEY` | Yes | `dev-secret` | JWT signing secret |
| `ADMIN_SEED_KEY` | No | `""` | Secret for bootstrapping first admin |
| `ENVIRONMENT` | No | `development` | `development` or `production` |
| `CORS_ORIGINS` | No | `["http://localhost:3000"]` | Allowed CORS origins (JSON array) |
| `S3_ENDPOINT` | Yes | `http://localhost:9000` | S3-compatible storage endpoint |
| `S3_PUBLIC_URL` | No | `http://localhost:9000` | Public-facing S3 URL |
| `S3_ACCESS_KEY` | Yes | `minioadmin` | S3 access key |
| `S3_SECRET_KEY` | Yes | `minioadmin` | S3 secret key |
| `S3_BUCKET` | No | `solhub` | S3 bucket name |
| `RESEND_API_KEY` | No | `""` | Resend email API key (logs to console in dev) |
| `EMAIL_FROM` | No | `SOL Hub <noreply@solhub.com>` | Sender address for outgoing emails |
| `NOTIFICATION_EMAIL` | No | `love@spacesoflearning.com` | Admin notification recipient |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for email links |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhook signing secret |
| `SENTRY_DSN` | No | — | Sentry error tracking DSN |
| `ENABLED_FEATURES` | No | `connections,forums,events,galleries,document_library,blog,reporting` | Comma-separated feature flags |

### Web (`apps/web/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000/api` | API base URL (include `/api` prefix) |
| `NEXT_PUBLIC_S3_URL` | No | `http://localhost:9000` | Public S3/MinIO URL for media |
| `NEXT_PUBLIC_ENABLED_FEATURES` | No | `connections` | Feature flags matching API |
| `NEXT_PUBLIC_SHAPO_WIDGET_ID` | No | — | Shapo testimonials widget ID |
| `NEXT_PUBLIC_SHAPO_FORM_ID` | No | — | Shapo testimonial submission form ID |

### Web (`apps/web/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:8000/api` | API base URL (include `/api` prefix) |

---

## Troubleshooting

### Port already in use
```bash
lsof -i :8000
lsof -i :3000
kill -9 <PID>
```

### Database connection refused
```bash
docker compose -f docker/docker-compose.yml ps
docker compose -f docker/docker-compose.yml restart postgres
```

### Migration issues
```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up -d postgres
cd apps/api && source .venv/bin/activate && alembic upgrade head
```

### Python venv not activated
```bash
cd apps/api && source .venv/bin/activate
which python3   # Should point to .venv/bin/python3
```

### pnpm not found
```bash
npm install -g pnpm
# Or use npx
npx pnpm install
```

### Two pages resolve to the same path
Route groups `(group)` don't affect the URL path. Having `(public)/page.tsx` and `(dashboard)/page.tsx` both resolve to `/`. Only one route group at the same level can have a `page.tsx`. Move one page to a different route or remove the duplicate.

---

## License

SPACES OF LEARNING IS A PRIVATE, MEMBERSHIP-BASED ORGANIZATION AND IS FUNCTIONING FOR LEARNING PURPOSES ONLY.

---

*Architecture by Next Level Development*
