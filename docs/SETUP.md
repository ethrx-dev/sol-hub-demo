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

> **Web CSS (Tailwind v4):** The web app compiles CSS through the `@tailwindcss/postcss` PostCSS plugin (`apps/web/postcss.config.mjs`). Both `@tailwindcss/postcss` and `tailwindcss` are declared in `apps/web/package.json`, so `pnpm install` provides them. `next.config.ts` intentionally does **not** enable `experimental.useLightningcss` — LightningCSS conflicts with PostCSS plugins and will crash the build. `globals.css` is imported in `src/app/layout.tsx` (do not reference it via a `<link href="/globals.css">`, which 404s).

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
CORS_ORIGINS=["http://localhost:3000"]

S3_ENDPOINT=http://localhost:9000
S3_PUBLIC_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=solhub

# Email (Resend) — logs to console in development
RESEND_API_KEY=
EMAIL_FROM=SOL Hub <noreply@solhub.com>
NOTIFICATION_EMAIL=admin@yourdomain.com
FRONTEND_URL=http://localhost:3000

# Feature flags (comma-separated)
ENABLED_FEATURES=connections,forums,events,galleries,document_library,blog,reporting

# Optional — Stripe for payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Web (`apps/web/.env`)

```env
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_S3_URL=http://localhost:9000
NEXT_PUBLIC_ENABLED_FEATURES=connections,forums,events,galleries,document_library,blog,reporting

# Optional — Shapo testimonials widget
NEXT_PUBLIC_SHAPO_WIDGET_ID=
NEXT_PUBLIC_SHAPO_FORM_ID=

# Optional — Plausible analytics
NEXT_PUBLIC_PLAUSIBLE_URL=https://plausible.io
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

## 4. Start Services (Docker Compose)

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- **PostgreSQL 16** on port 5432
- **Redis 7** on port 6379
- **MinIO** on ports 9000 (S3 API) and 9001 (Console)

### Create S3 Bucket

After starting MinIO, create the required bucket:

```bash
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

### Feature Flags

Both `apps/api/.env` (`ENABLED_FEATURES`) and `apps/web/.env` (`NEXT_PUBLIC_ENABLED_FEATURES`) control which features are accessible. Available features:

| Flag | Description |
|------|-------------|
| `connections` | Follow/unfollow other users |
| `forums` | Discussion categories, threads, replies |
| `events` | Events CRUD, RSVP, upcoming/past lists |
| `galleries` | Photo/video albums with upload |
| `document_library` | Resource document repository |
| `blog` | Blog posts with admin management |
| `reporting` | Report content, block users, admin moderation |

Features not in the list are hidden from navigation and guarded by the `FeatureGuard` component.

### Email Notifications (Resend)

Set `RESEND_API_KEY` in `apps/api/.env`. In development mode (`ENVIRONMENT=development`), emails are logged to the console instead of being sent. In production, they are sent via the Resend API with an HTML template. The sender must be verified in your Resend account.

```env
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=SOL Hub <noreply@yourdomain.com>
NOTIFICATION_EMAIL=admin@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### Stripe Payments

1. Create products and prices in Stripe dashboard with price IDs: `price_innovator`, `price_mentor`, `price_investor`
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `apps/api/.env`
3. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `apps/web/.env`

### Shapo Testimonials

1. Sign up at Shapo.io, create a widget (display wall), and set `NEXT_PUBLIC_SHAPO_WIDGET_ID` in `apps/web/.env`
2. (Optional) Create a form (submission form) in Shapo, and set `NEXT_PUBLIC_SHAPO_FORM_ID` in `apps/web/.env` to enable user testimonial submission directly on the `/testimonials` page

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
| Auth (JWT + refresh tokens) | Built | bcrypt hashing, rate-limited, verify-email flow, password reset |
| Onboarding flow | Built | Role selection, skills, sectors of interest |
| Project CRUD + milestones | Built | Status workflow: draft → submitted → active → funded → completed |
| Matchmaking | Built | Express interest, accept/decline, mentor/investor matching |
| Workspace (real-time messaging) | Built | WebSocket with workspace authorization |
| Document upload | Built | MinIO/S3 storage, magic byte validation, 50 MB limit |
| Email notifications | Built | Resend (dev: console logging, prod: actual send) |
| Stripe payments | Built | 4 plans, checkout, Customer Portal, webhooks, idempotent processing |
| Community feed + posts | Built | Image/video upload, comments, likes |
| Groups + members | Built | Create, join/leave, member directories |
| Forums | Built | Categories, threads, replies |
| Events | Built | CRUD, RSVP, upcoming/past filtering |
| Galleries | Built | Photo/video albums, media upload |
| Blog | Built | Admin-managed posts with public pages |
| Connections (follow) | Built | Follow/unfollow users |
| Global search | Built | Cross-entity search (projects, users, posts, groups, resources, events) |
| Activity timeline | Built | Activity stream across platform actions |
| Contact form | Built | Admin notification + user confirmation email |
| Resource library | Built | Curated resources with detail pages |
| Doc library | Built | Document repository for community |
| Pillar video submissions | Built | Video intros for innovators, mentors, investors |
| CMS pages | Built | Admin-managed dynamic pages with section-based editor |
| Public user profiles | Built | `/users/[id]` with avatar, bio, skills |
| Admin panel | Built | Stats, users, projects, matches, pricing, media, pages, blog, pillar submissions, reports |
| Super admin | Built | Groups/posts/resources CRUD, user deactivation, role management |
| Notification preferences | Built | In-app + email toggle groups per category |
| Profile video/avatar | Built | Upload from settings |
| Reporting & moderation | Built | Report content, block users, admin review queue |
| Rate limiting | Built | slowapi on auth and sensitive endpoints |
| Analytics | Built | Plausible script injection |
| Donations (one-time, Stripe webhook) | Built | Donation model + migration, webhook handler (idempotent, signature-verified), admin donations dashboard |
| Security audits | Built | Startup guards on weak secrets, CSP headers, CORS enforcement |
