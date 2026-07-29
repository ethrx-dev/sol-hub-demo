# SOL Hub — Living Documentation

> **Last updated:** 2026-07-28
> **Repo:** `github.com/ethrx-dev/sol-hub-demo` (branch `v6`)
> **Live:** `https://dev.spacesoflearning.com`
> **VPS:** `177.7.55.103` (user: `nldev-agent`)

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Directory Structure](#2-directory-structure)
3. [Data Model](#3-data-model)
4. [API Reference](#4-api-reference)
5. [Frontend Routes & Components](#5-frontend-routes--components)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Deployment](#7-deployment)
8. [Feature Status](#8-feature-status)
9. [Development Workflow](#9-development-workflow)
10. [Known Issues](#10-known-issues)
11. [Backups & Restore Points](#11-backups--restore-points)
12. [User Guide](#12-user-guide)

---

## 1. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Caddy     │────▶│  Next.js 15  │     │  FastAPI   │
│  (reverse   │     │  (App Router)│     │ (uvicorn)  │
│   proxy)    │     │  :3000       │     │  :8000     │
└─────────────┘     └──────┬───────┘     └─────┬──────┘
       │                   │                   │
       │            ┌──────┴───────┐     ┌──────┴──────┐
       │            │  PostgreSQL  │     │    Redis    │
       │            │    :5432     │     │   :6379     │
       │            └──────────────┘     └─────────────┘
       │
       └──────────────────────────────────┐
                                   ┌──────┴──────┐
                                   │    MinIO    │
                                   │  S3 storage │
                                   │  :9000/9001 │
                                   └─────────────┘
```

### Services

| Service | Port | Tech | Role |
|---------|------|------|------|
| Caddy | 80/443 | Go | Reverse proxy, TLS termination |
| Next.js | 3000 | React 19, Next.js 15 | Frontend (App Router) |
| FastAPI | 8000 | Python 3.13, SQLAlchemy async | REST API |
| PostgreSQL | 5432 | PG16 | Primary database |
| Redis | 6379 | — | Caching, rate limiting sessions |
| MinIO | 9000/9001 | — | S3-compatible object storage (avatars, videos) |

### Domain Model

```
User ──▶ Profile (1:1)
  │
  ├──▶ Project ──▶ Milestone
  │         │
  │         └──▶ Match ──▶ Investment
  │
  ├──▶ PillarSubmission
  │
  ├──▶ BlogPost (story/review)
  │
  ├──▶ Notification
  │
  ├──▶ Post / Comment / Like
  │
  └──▶ Connection / Message / Group
```

---

## 2. Directory Structure

```
sol-hub-demo/
├── apps/
│   ├── api/                          # FastAPI backend
│   │   ├── alembic/                  # DB migrations
│   │   │   ├── versions/             # Migration files
│   │   │   └── env.py
│   │   ├── src/
│   │   │   ├── main.py               # App entry point
│   │   │   ├── config.py             # Pydantic settings (env vars)
│   │   │   ├── database.py           # SQLAlchemy async engine
│   │   │   ├── deps.py               # Dependency injection (DbSession, CurrentUser, etc.)
│   │   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── schemas/              # Pydantic request/response schemas
│   │   │   ├── routers/              # API route handlers
│   │   │   ├── middleware/           # FastAPI middleware (rate limiting, security)
│   │   │   └── utils/                # Shared utilities (email, storage, AI, etc.)
│   │   └── requirements.txt
│   │
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   │   ├── (auth)/           # Auth pages (login, register, onboarding, assess)
│       │   │   ├── (dashboard)/      # Dashboard pages (admin, innovator, mentor, investor, participant)
│       │   │   ├── (public)/         # Public pages (home, about, resonance, blog, etc.)
│       │   │   └── settings/         # Settings page
│       │   ├── components/
│       │   │   ├── admin/            # Admin editors (section-renderers, rich-text-editor)
│       │   │   ├── forms/            # Form components (onboarding-flow, etc.)
│       │   │   ├── layout/           # Layout components (navbar, sidebar, dashboard-layout)
│       │   │   ├── shared/           # Shared components (VideoRecorder, match-card, etc.)
│       │   │   └── ui/               # UI primitives (button, card, input, select, etc.)
│       │   ├── hooks/                # Custom React hooks
│       │   ├── lib/                  # Utilities (auth, api-client, mentor types)
│       │   └── stores/               # Zustand stores (notification, tour)
│       └── package.json
│
└── docs/                             # Documentation
```

---

## 3. Data Model

### Core Tables (55 total)

#### Users & Profiles

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | id, email, password_hash, full_name, role, onboarding_completed, membership_agreed_at | Role: innovator/mentor/investor/participant/admin |
| `profiles` | id, user_id, role_specific_data (JSONB), onboarding_responses (JSONB), video_submission_url | JSONB fields hold flexible role-specific data |

#### Projects & Matching

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `projects` | id, title, description, sector, sub_sector, innovator_id, status | Status: idea/active/completed/cancelled |
| `matches` | id, project_id, mentor_id, investor_id, status, notes, score | Status: pending/accepted/declined |
| `match_settings` | id=1 (singleton), sector_weight, skill_weight, mentor_exact_weight, mentor_partial_weight, guided_weight, quality_threshold, ai_enabled, ai_weight | Singleton row, admin-configurable |
| `investments` | id, project_id, investor_id, amount, status | |
| `milestones` | id, project_id, title, status, due_date | |

#### Content

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `pages` | id, slug (unique), title, status, sections (JSONB), seo (JSONB) | CMS pages with 22 section types |
| `page_revisions` | id, page_id, sections_snapshot (JSONB) | Revision history |
| `blog_posts` | id, title, content, author_id, status, review_status | Review status: pending_review/approved/rejected |
| `pillar_submissions` | id, pillar, user_id, storage_url, storage_key, mentor_type | Pillar: innovators/mentors/investors/participants |

#### Social

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `connections` | requester_id, addressee_id, status | |
| `messages` | sender_id, receiver_id, content | |
| `group_messages` | group_id, sender_id, content | |
| `notifications` | user_id, title, message, notification_type, is_read | |
| `notification_preferences` | user_id, various boolean preferences | |

#### Commerce

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `donations` | amount, currency, stripe_session_id, status, user_id | |
| `subscriptions` | user_id, stripe_subscription_id, tier, status | |
| `affiliate_codes` | code, user_id, discount_percent | |

#### System

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `forum_categories` / `forum_threads` / `forum_replies` | | |
| `events` / `event_attendees` | | |
| `resources` / `documents` | | |
| `albums` / `album_media` | | |
| `activity_logs` | | |
| `reports` / `blocks` | | |
| `webhook_events` | | |
| `verification_tokens` / `password_reset_tokens` / `refresh_tokens` | | |

### JSONB Fields (role_specific_data)

Stored on `profiles.role_specific_data` — no schema migration needed for new fields:

```json
{
  "innovator_type": 1,            // 1-4 from assessment
  "mentor_type": "psych",         // psych | prof | coach
  "resonance_gateway_engaged": true,
  "assessment_answers": {
    "problem_clarity": 2,
    "solution_clarity": 1,
    "assistance_needed": "research"
  }
}
```

Stored on `profiles.onboarding_responses`:

```json
{
  "guided_answers": {
    "q1": "answer text",
    "q2": "answer text"
  }
}
```

---

## 4. API Reference

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | None | Register (rate: 5/min) |
| POST | `/api/auth/login` | None | Login |
| POST | `/api/auth/refresh` | None | Refresh token |
| GET | `/api/auth/me` | User | Current user profile |
| PATCH | `/api/auth/me` | User | Update profile |
| PUT | `/api/auth/change-password` | User | Change password |
| POST | `/api/auth/forgot-password` | None | Send reset email |
| POST | `/api/auth/reset-password` | None | Reset with token |
| POST | `/api/auth/verify-email` | None | Verify email |
| POST | `/api/auth/resend-verification` | None | Resend verification |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/{id}` | None | Public profile |
| PATCH | `/api/users/me` | User | Update own profile |
| POST | `/api/users/me/avatar` | User | Upload avatar |
| POST | `/api/users/me/engage-resonance` | User | Mark resonance gateway as engaged |
| POST | `/api/users/me/change-role` | User (participant) | Upgrade to innovator |

### Innovator Assessment

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/innovator/assess` | User (innovator) | Submit questionnaire → get type 1-4 |

### Projects

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/projects/` | User | List own projects |
| POST | `/api/projects/` | User (innovator) | Create project |
| GET | `/api/projects/{id}` | User | Get project |
| PATCH | `/api/projects/{id}` | User (owner) | Update project |

### Matches

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/matches` | User | List my matches |
| POST | `/api/matches` | User | Create match request |
| PATCH | `/api/matches/{id}` | User (participant) | Accept/decline |
| GET | `/api/matches/suggestions?project_id=X&role=mentor` | User | AI-scored mentor suggestions |
| GET | `/api/matches/{id}` | User | Get match detail |

### Pillars (Video Submissions)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/pillars/submit-video` | User | Upload intro video |
| GET | `/api/pillars/submissions` | Admin | List all submissions |

### Files

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/files/{storage_key}` | None | Serve uploaded files (avatars, videos) |

### CMS (Pages)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/pages/{slug}` | None | Get published page by slug |
| GET | `/api/admin/pages` | Admin | List all pages |
| POST | `/api/admin/pages` | Admin | Create page |
| PUT | `/api/admin/pages/{id}` | Admin | Update page |
| DELETE | `/api/admin/pages/{id}` | Admin | Soft-delete |
| POST | `/api/admin/pages/seed` | Admin | Seed default pages |
| GET/PUT | `/api/admin/pages/{id}/sections/{section_id}` | Admin | Section operations |
| PUT | `/api/admin/pages/{id}/sections/reorder` | Admin | Reorder sections |
| GET/POST | `/api/admin/pages/{id}/revisions` | Admin | Revision management |
| POST | `/api/admin/pages/{id}/revisions/{rev_id}/restore` | Admin | Restore revision |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/PUT | `/api/admin/match-settings` | Admin | Match scoring configuration (includes AI toggle) |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| Various | `/api/admin/*` | Admin | CRUD for users, projects, posts, resources, etc. |

### Social

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/feed` | User | Activity feed |
| CRUD | `/api/groups` | User | Groups |
| CRUD | `/api/forums` | User | Forums |
| CRUD | `/api/events` | User | Events |
| CRUD | `/api/galleries` | User | Galleries |
| GET/POST | `/api/connections` | User | Connections |
| GET/POST | `/api/messages` | User | Messages |

### AI Scoring (Feature 8)

**Blended scoring formula:**
```
final_score = deterministic_score × (100 - ai_weight)/100 + ai_score × ai_weight/100
```

- `ai_enabled` toggle + `ai_weight` slider in `/admin/match-settings`
- When AI is enabled, top 20 deterministic candidates are sent to OpenRouter
- AI returns `{score: 0-100, reason: "..."}` 
- Falls back to deterministic if AI call fails or key is missing

---

## 5. Frontend Routes & Components

### Public Routes (`/(public)`)

| Route | Description |
|-------|-------------|
| `/` | Landing page (11 CMS sections) |
| `/what-we-do` | What We Do page (11 CMS sections) |
| `/about` | About page (13 CMS sections) |
| `/resonance` | Resonance Gateway (Whitney intro) |
| `/become-a-member` | Join page (7 CMS sections) |
| `/innovators` | Innovators pillar page |
| `/mentors` | Mentors pillar page |
| `/investors` | Conscious Investors pillar page |
| `/blog` | Blog listing |
| `/blog/[slug]` | Blog post |
| `/contact` | Contact form |
| `/services` | Services page |
| `/resources` | Resources listing |
| `/hub/*` | Community hub (feeds, groups, forums, events) |
| `/membership-agreement` | Legal |
| `/terms` | Terms |
| `/privacy` | Privacy |

### Auth Routes (`/(auth)`)

| Route | Description |
|-------|-------------|
| `/login` | Login |
| `/register` | Register |
| `/onboarding` | Multi-step onboarding wizard |
| `/assess` | Innovator self-assessment (types 1-4) |
| `/forgot-password` | Password reset |
| `/reset-password` | Reset with token |
| `/verify-email` | Email verification |

### Dashboard Routes (`/(dashboard)`)

| Route | Description |
|-------|-------------|
| `/innovator` | Innovator dashboard |
| `/innovator/projects` | Innovator's projects |
| `/innovator/projects/new` | Create project |
| `/innovator/projects/[id]` | Project detail |
| `/innovator/matches` | Innovator's matches |
| `/innovator/matches/suggestions` | AI mentor suggestions |
| `/innovator/story` | Innovator's story editor |
| `/mentor` | Mentor dashboard |
| `/mentor/browse` | Browse projects |
| `/mentor/matches` | Mentor's matches |
| `/investor` | Investor dashboard |
| `/investor/browse` | Browse projects |
| `/investor/matches` | Investor's matches |
| `/investor/portfolio` | Investment portfolio |
| `/participant` | Participant dashboard |
| `/admin` | Admin dashboard |
| `/admin/pages` | CMS page editor |
| `/admin/pages/[id]/edit` | CMS page detail editor (with TipTap WYSIWYG) |
| `/admin/match-settings` | Match weighting configuration |
| `/admin/users` | User management |
| `/admin/projects` | Project management |
| `/admin/pillar-submissions` | Video submissions review |
| Admin CRUD: blog, posts, media, groups, resources, donations, matches, stories, reports, pricing |

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Navbar` | `components/layout/navbar.tsx` | Top navigation (all roles) |
| `Sidebar` | `components/layout/sidebar.tsx` | Dashboard sidebar (role-specific) |
| `DashboardLayout` | `components/layout/dashboard-layout.tsx` | Shared dashboard layout (Whitney banner) |
| `OnboardingFlow` | `components/forms/onboarding-flow.tsx` | Multi-step onboarding wizard |
| `VideoRecorder` | `components/shared/VideoRecorder.tsx` | Browser-based video recording |
| `RichTextEditor` | `components/admin/rich-text-editor.tsx` | TipTap WYSIWYG for CMS sections |
| `SectionEditor` | `components/admin/section-renderers.tsx` | Section type editor in CMS page editor |
| `MentorSuggestionCard` | `components/shared/mentor-suggestion-card.tsx` | Match suggestion card with AI score |
| `ResonanceStewardIntro` | `components/shared/resonance-steward-intro.tsx` | Whitney intro card |

---

## 6. Authentication & Authorization

### Role Hierarchy

```
admin / super_admin ─── full access
  ├── innovator ─── create projects, submit stories, request matches
  ├── mentor ─── browse projects, accept matches, guided Q&A
  ├── investor ─── browse projects, invest, accept matches
  └── participant ─── browse hub, record intro video, optionally upgrade to innovator
```

### Auth Flow

1. **Register** → JWT tokens issued → redirect based on role:
   - Innovator → `/assess` (questionnaire) → `/onboarding`
   - All others → `/onboarding`
2. **Login** → Check `onboarding_completed`:
   - Not completed & innovator without assessment → `/assess`
   - Not completed → `/onboarding`
   - Completed → role-specific dashboard
3. **Onboarding guard** — `DashboardLayout` redirects to `/onboarding` if not completed

### Token System

- **Access token:** JWT, 30 min expiry, stored in `localStorage`
- **Refresh token:** SHA-256 hash stored in DB, 7 day expiry
- **Rate limiting:** Login/register: 5/min per IP (via `slowapi` + Redis)

---

## 7. Deployment

### VPS Setup

| Service | Type | Status |
|---------|------|--------|
| API | systemd (`solhub-api`) | `Restart=always` |
| Web | systemd (`solhub-web`) | `Restart=always` |
| Health check | cron (`/etc/cron.d/solhub-health`) | Every 5 min, restarts unresponsive service |

### Deploy Paths

```
API source:   /home/nldev-agent/src/apps/api/src/
API .env:     /home/nldev-agent/src/apps/api/.env
API venv:     /home/nldev-agent/dev/sol-hub-demo/apps/api/.venv/
API log:      /home/nldev-agent/src/apps/api.log
Web source:   /home/nldev-agent/solhub_web/apps/web/
Web service:  solhub-web.service
```

### Environment Variables (api/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | local dev | PostgreSQL async connection string |
| `SECRET_KEY` | Yes | dev-secret | JWT signing key |
| `S3_ENDPOINT` | Yes | localhost:9000 | MinIO endpoint |
| `S3_ACCESS_KEY` | Yes | minioadmin | MinIO access key |
| `S3_SECRET_KEY` | Yes | minioadmin | MinIO secret key |
| `S3_BUCKET` | Yes | solhub | MinIO bucket name |
| `RESEND_API_KEY` | For email | "" | Resend email API key |
| `LLM_API_KEY` | For AI | "" | OpenRouter API key |
| `LLM_MODEL` | No | openai/gpt-4o-mini | OpenRouter model |
| `LLM_BASE_URL` | No | https://openrouter.ai/api/v1 | OpenRouter base URL |
| `STRIPE_SECRET_KEY` | For payments | "" | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | "" | Stripe webhook secret |
| `ENVIRONMENT` | No | development | `development` logs emails; `production` sends |

### Deployment Method

All deploys via SSH pipe (SCP blocked on VPS):
```bash
# API file
cat file.py | ssh user@host 'cat > /path/on/vps/file.py'

# Frontend file  
cat component.tsx | ssh user@host 'cat > /path/on/vps/component.tsx'

# Node modules (tar.gz)
tar -czf - node_modules/@tiptap | ssh user@host 'cd /web/path && tar -xzf -'

# Restart API
ssh user@host 'kill -9 $(pgrep -f "[u]vicorn")'   # systemd auto-restarts

# Restart Web
ssh user@host 'kill -9 $(pgrep -f "next-server")'  # systemd auto-restarts
```

---

## 8. Feature Status

| # | Feature | Status | Branch | Notes |
|---|---------|--------|--------|-------|
| — | CMS Dynamic Pages | ✅ Done | `v6` | 8 pages, 29 section types, DynamicPage renderer |
| — | Resonance Gateway | ✅ Done | `v6` | `/resonance` + Whitney flow + home weave |
| — | Landing Page CTA Flow | ✅ Done | `v6` | All 7 CTA issues fixed |
| — | TipTap WYSIWYG Editor | ✅ Done | `v6` | Rich text for CMS sections |
| — | Participant Video | ✅ Done | `v6` | 90s no-questions video during onboarding + dashboard |
| — | Whitney Integration | ✅ Done | `v6` | Step 2, All Set CTA, dashboard banner, resonance tracking |
| — | Innovator Assessment | ✅ Done | `v6` | Self-assessment questionnaire, types 1-4, scoring integration |
| — | Role Conversion | ✅ Done | `v6` | Participant → innovator upgrade path |
| — | Systemd Services | ✅ Done | — | API + Web + cron health checks |
| — | Email (Resend) | 🟡 Configured | — | Key set, dev mode (logged only) |
| 1 | Participant Role | ✅ Done | `v6` | |
| 2 | Whitney Notifications | ✅ Done | `v6` | |
| 3 | Post-Onboarding Story Flow | ✅ Done | `v6` | |
| 4 | Matching Overhaul | ✅ Done | `v6` | Mentor types, guided Q&A, configurable weights |
| 4f | Match Weighting (admin) | ✅ Done | `v6` | Sector/skill/mentor/guided/threshold |
| 5 | Marketplace | ❄️ Pending | — | |
| 6 | Main Page UX Cleanup | ✅ Done | `v6` | |
| 7 | Donation Page Activation | ✅ Done | `v6` | Stripe keys absent, webhook 501 |
| 8 | AI Scoring | ✅ Done | `v6` | OpenRouter, configurable ai_weight |

---

## 9. Development Workflow

### Creating a New Feature

1. Create restore point: `git tag vX.Y.Z-pre-feature-name && git push origin vX.Y.Z-pre-feature-name`
2. Create git bundle: `git bundle create ../backups/feature-name-pre.bundle --all`
3. Work on branch `v6`
4. Commit regularly with descriptive messages
5. Push: `git push origin v6`
6. Deploy to VPS via SSH pipe

### Adding a New API Router

1. Create `apps/api/src/routers/{name}.py` with `router = APIRouter(prefix="/api/{name}")`
2. Register in `apps/api/src/routers/feature_registry.py` (import + CORE_ROUTERS)
3. Create schemas in `apps/api/src/schemas/{name}.py`
4. Verify Python syntax
5. Deploy + restart API

### Adding a New Page

1. Create `apps/web/src/app/(route-group)/{path}/page.tsx`
2. Use `"use client"` for client components
3. Import from `@/src/lib/api-client` for API calls
4. Use `@/src/components/ui/*` for UI primitives
5. Verify with `npx next build --no-lint`
6. Deploy + web auto-restarts via systemd

### CMS Page Management

- **Add content:** Admin → Pages → Edit → Add Section → configure → Save
- **JSONB dirty tracking issue:** `PUT /api/admin/pages/{id}/sections/{section_id}` does NOT persist JSONB changes. Use `PUT /api/admin/pages/{id}` (full page replacement) instead.
- **Seed pages:** `POST /api/admin/pages/seed` only creates if slug doesn't exist.
- **TipTap WYSIWYG:** Available for `text`, `html`, and `columns` section types.

---

## 10. Known Issues

| Issue | Status | Details |
|-------|--------|---------|
| Stripe keys absent | 🟡 | `/api/membership/webhooks/stripe` returns 501 |
| Email in dev mode | 🟡 | `ENVIRONMENT=development` — emails logged only. Switch to `production` to send. |
| Onboarding persistence | 🔍 | `role_specific_data.mentor_type` + `onboarding_responses.guided_answers` columns exist but write path from onboarding flow unverified |
| Whitney's real email | 📝 | `WHITNEY_EMAIL` defaults to `admin@solvearth.org` |
| §G Modes of Contribution | ❄️ | Documented in `RESONANCE_GATEWAY_PLAN_v3.md`, not built as UI |
| Marketplace (Feature 5) | ❄️ | Not started |
| GitHub default branch | 📝 | Still `v5` — change to `main` in repo settings, then delete remote `v5` |
| JSONB dirty tracking | 📝 | Use full page replacement, not section-level updates |

---

## 11. Backups & Restore Points

| Tag | Description |
|-----|-------------|
| `v6.0.0` | After v6 merged to main, before git cleanup |
| `v6.0.1-pre-tiptap` | Before TipTap WYSIWYG |
| `v6.0.2-pre-participant-video` | Before participant video onboarding |
| `v6.1.0-pre-innovator-questionnaire` | Before innovator assessment |
| `v6.2.0-pre-whitney-flow` | Before Whitney flow integration |

**Bundle backups** at `/home/alchemical1/backups/pre-cleanup/`:
- `sol-hub-demo.bundle` (full repo)
- `sol-hub-demo-tiptap-pre.bundle`
- `sol-hub-demo-participant-video-pre.bundle`
- `sol-hub-demo-innovator-q-pre.bundle`
- `sol-hub-demo-whitney-pre.bundle`

**VPS backups** at `/home/nldev-agent/backups/`:
- `sol-hub-demo.tar.gz` (full API repo)
- `solhub_web.tar.gz` (web app, excluding node_modules/.next)

---

## 12. User Guide

### Personas Overview

| Persona | Role in System | Primary Goal |
|---------|---------------|--------------|
| **New Visitor** | None (pre-registration) | Learn about SOL, decide to join |
| **New Member** | Any role (post-registration) | Complete onboarding, get oriented |
| **Participant** | `participant` | Explore community, discover path |
| **Innovator** | `innovator` | Submit projects, get matched |
| **Mentor** | `mentor` | Guide innovators, share expertise |
| **Investor** | `investor` | Fund projects, support mission |
| **Admin** | `admin` | Manage platform, review content |
| **Whitney** | `admin` | Resonance Gateway, member welcome |
| **Laurel** | `admin` | Content management, communications |
| **Tom** | `admin` | Strategy oversight, mentor coordination |

---

### 12.1 New Visitor Flow

**Entry points:**
- Lands on homepage (`/`)
- May arrive at any public page via search/link

**Path to conversion:**

```
Homepage → /what-we-do → /innovators | /mentors | /investors → /become-a-member → /register
                              ↘                               ↗
                         /resonance (meet Whitney)
```

**Key actions available without login:**
- Browse all public pages (home, about, what-we-do, resonance, blog, resources)
- View pillar pages (innovators, mentors, investors)
- Read blog posts and resources
- Visit `/resonance` to learn about the Resonance Gateway
- Register at `/register`

---

### 12.2 New Member Flow (All Roles)

**After registration:**

| Step | Action | Location | Notes |
|------|--------|----------|-------|
| 1 | Receive welcome email | Email | Signed by Whitney as Resonance Steward |
| 2 | Receive in-app notification | Notifications | "Welcome — You Are Invited to Be Met" |
| 3 | Innovator assessment | `/assess` | Only for innovator role — 3 questions, determines type 1-4 |
| 4 | Onboarding | `/onboarding` | Multi-step wizard with role-specific steps |

**Onboarding Steps by Role:**

| Step | Innovator | Mentor | Investor | Participant |
|------|-----------|--------|----------|-------------|
| 1 | Welcome | Welcome | Welcome | Welcome |
| 2 | Meet Whitney | Meet Whitney | Meet Whitney | Meet Whitney |
| 3 | Record Video | Mentor Type | Record Video | Record Video |
| 4 | Profile | Record Video | Profile | Profile |
| 5 | Your Story | Guided Q&A | All Set | All Set |
| 6 | All Set | Profile | — | — |
| 7 | — | All Set | — | — |

**After onboarding:** Redirected to role-specific dashboard.

---

### 12.3 Participant Guide

**Dashboard access:** `/participant`

**Available actions:**

| Action | Location | Description |
|--------|----------|-------------|
| Meet Whitney | Dashboard top card → `/resonance` | Learn about the Resonance Gateway |
| Record intro video | Dashboard → "Record Your Intro" | 90-second video introduction (no questions) |
| Explore community | `/hub` | Browse feeds, groups, forums, events |
| Browse resources | `/resources` | Access guides, templates, learning materials |
| View notifications | `/notifications` | Community activity, messages |
| Upgrade to innovator | Dashboard → "Become an Innovator" | Converts role, triggers `/assess` questionnaire |

**Participant restrictions:**
- Cannot create projects
- Cannot initiate matches
- Cannot submit pillar videos (except participant intro)
- Dashboard has video recording option (no questions, 90s timer)

---

### 12.4 Innovator Guide

**Dashboard access:** `/innovator`

**Assessment result:** Type 1-4 determines recommended mentor type:
- Type 1 (Explorer) → Psychologist mentor
- Type 2 (Definer) → Professor mentor
- Type 3/4 (Resolver/Implementer) → Coach mentor

**Available actions:**

| Action | Location | Description |
|--------|----------|-------------|
| Manage projects | `/innovator/projects` | Create, edit, track project status |
| Create project | `/innovator/projects/new` | Submit new project for matching |
| Find mentor | `/innovator/matches/suggestions` | AI-scored mentor suggestions |
| View matches | `/innovator/matches` | Incoming/outgoing match requests |
| Write story | `/innovator/story` | Submit story for admin review |
| Accept/decline matches | Notification / matches page | Respond to mentor/investor interest |

**Project lifecycle:**

```
Draft → Active → Matched → In Progress → Completed
  │                    │
  │              Mentor assigned     Investment secured
  │                    │
  └── Can be edited    │
                  Milestones tracked
```

**Video questions (3 × 30s):**
1. "What's the problem? What do you feel is wrong?"
2. "Describe your solution or why it's important to solve"
3. "What kind of help do you need?"

---

### 12.5 Mentor Guide

**Dashboard access:** `/mentor`

**Available actions:**

| Action | Location | Description |
|--------|----------|-------------|
| Browse projects | `/mentor/browse` | View innovator projects seeking mentors |
| View matches | `/mentor/matches` | Current and past matches |
| Accept/decline requests | Matches page | Respond to innovator match requests |
| Guided Q&A | Onboarding step 5 | Answer role-specific questions |

**Mentor types:** Self-selected during onboarding:
- **Psychologist (Catalyst):** Helps innovators move from vague concern to "problem worth fixing"
- **Professor (Architect):** Helps novice innovators generate structured plans
- **Coach (Builder):** Assists with design, production, manufacturing

**Video questions by type:**

| Type | Q1 | Q2 | Q3 |
|------|----|----|----|
| Psychologist | What does psychological mentorship mean to you? | Share a story of guiding someone through a breakthrough. | What inner quality do you most help others cultivate? |
| Professor | What professional achievement are you most proud of guiding? | How do you approach mentoring someone at a crossroads? | What is the most important professional lesson you share? |
| Coach | What coaching philosophy guides your practice? | Describe a time your coaching made a lasting impact. | What skill do you most enjoy helping others build? |

**Mentor-type-specific guided questions** are shown after the video step during onboarding.

---

### 12.6 Investor Guide

**Dashboard access:** `/investor`

**Available actions:**

| Action | Location | Description |
|--------|----------|-------------|
| Browse projects | `/investor/browse` | View projects seeking investment |
| View matches | `/investor/matches` | Current and past matches |
| View portfolio | `/investor/portfolio` | Active investments |
| Accept/decline requests | Matches page | Respond to innovator match requests |

**Video questions (3 × 30s):**
1. "How involved do you want to be?"
2. "What resources do you have? (Land, capital, experience)"
3. "Besides money, what do you see as your Return on Investment?"

---

### 12.7 Admin Guide

**Dashboard access:** `/admin`

**Admin credentials:**
- `admin@solvearth.org` / `admin123!` (dev)

**Available sections:**

| Section | Path | Description |
|---------|------|-------------|
| Dashboard | `/admin` | Overview stats |
| Users | `/admin/users` | Manage user accounts, roles |
| Projects | `/admin/projects` | Manage all projects, change status |
| Pages | `/admin/pages` | CMS editor — create/edit pages, manage sections |
| Match Settings | `/admin/match-settings` | Configure scoring weights, AI toggle |
| Pillar Submissions | `/admin/pillar-submissions` | Review video submissions (all pillars) |
| Matches | `/admin/matches` | View/create all matches |
| Posts | `/admin/posts` | Manage community posts |
| Blog | `/admin/blog` | Manage blog posts |
| Resources | `/admin/resources` | Manage resource library |
| Groups | `/admin/groups` | Manage community groups |
| Media | `/admin/media` | Manage uploaded media |
| Stories | `/admin/stories` | Review/approve innovator stories |
| Donations | `/admin/donations` | View donation history |
| Reports | `/admin/reports` | View flagged content |
| Pricing | `/admin/pricing` | Configure membership pricing |

**CMS Page Editing:**

1. Navigate to `/admin/pages`
2. Click "Edit" on any page or "New Page"
3. Sections are listed in the sidebar — click to edit
4. **TipTap WYSIWYG editor** available for these section types:
   - `text` — Body field uses rich text editor
   - `html` — Custom HTML field uses rich text editor
   - `columns` — Left/Right content fields use rich text editor
5. Add new sections from the section type dropdown
6. Drag sections to reorder, or use up/down buttons
7. Click "Save" to persist changes
8. Revisions are automatically created — can be restored from the revisions panel

**Important note:** Use full page save (`PUT /api/admin/pages/{id}`) rather than section-level updates due to a JSONB dirty tracking issue.

**Match Settings Configuration:**

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Sector Weight | 0-100 | 10 | Points for sector overlap |
| Skill Weight | 0-100 | 15 | Points for skill match |
| Mentor Exact Weight | 0-100 | 25 | Points for exact mentor type match |
| Mentor Partial Weight | 0-100 | 5 | Points for partial mentor type match |
| Guided Weight | 0-100 | 10 | Points for guided answer similarity |
| Quality Threshold | 0-100 | 50 | Minimum score for Whitney notification |
| AI Enabled | true/false | true | Toggle AI scoring |
| AI Weight | 0-100 | 30 | AI influence on final score (0 = deterministic, 100 = AI only) |

**AI scoring formula:**
```
final_score = deterministic × (100 - ai_weight)/100 + ai_score × ai_weight/100
```

---

### 12.8 Whitney Guide (Resonance Steward)

**Login:** Admin credentials

**Whitney's role is to be the first living gateway — her touchpoints are:**

| Touchpoint | Trigger | Location | Content |
|------------|---------|----------|---------|
| Welcome email | New registration | Email | Signed by Whitney, invites to be met |
| In-app notification | New registration | Notifications | "Welcome — You Are Invited to Be Met" |
| Resonance Gateway page | User visits | `/resonance` | Full page with Whitney intro + principles |
| Onboarding step 2 | During onboarding | `/onboarding` | "Meet Whitney" — named, quoted, linked |
| All Set step | End of onboarding | `/onboarding` | "Meet Whitney" CTA link |
| Dashboard banner | Post-onboarding | All dashboards | Persistent until dismissed |
| Quality match alert | Match score >= 70 | Notifications + email | Notifies when high-quality mentor match created |

**Actions Whitney can take as admin:**

| Action | Where | How |
|--------|-------|-----|
| View new members | `/admin/users` | See who registered, their role, assessment results |
| Review video submissions | `/admin/pillar-submissions` | Watch intro videos from all pillars |
| Review innovator stories | `/admin/stories` | Read and approve/reject innovator stories |
| Monitor quality matches | Notifications + email | Receive alerts for high-scoring mentor matches |
| Configure matching | `/admin/match-settings` | Adjust how AI and deterministic scoring work |
| Update Resonance Gateway page | `/admin/pages` → edit "resonance" | Modify the `/resonance` page content |
| Manage member notifications | System sends automatically | Welcome notifications sent on registration |

**The Mirror principle:**
> "The mirror has no identity. I'm not deciding whether you belong. I'm holding a quality of conversation in which people become more visible to themselves."

---

### 12.9 Laurel Guide (Content & Communications)

**Login:** Admin credentials

**Laurel's role focuses on content management and member communications:**

| Action | Where | How |
|--------|-------|-----|
| Edit public pages | `/admin/pages` | Update any CMS page content |
| Manage blog | `/admin/blog` | Create, edit, publish blog posts |
| Manage resources | `/admin/resources` | Upload and organize resource library |
| Review innovator stories | `/admin/stories` | Approve/reject stories with feedback |
| Create/update page sections | `/admin/pages/[id]/edit` | Use TipTap editor for rich content |
| Manage media library | `/admin/media` | Upload and organize images, documents |
| Configure email content | Code-level | Welcome email template in `utils/email.py` |

**Content workflow:**

```
Draft → Review → Published
  │
  └── Can create revisions at any stage
```

**TipTap editing tips:**
- Toolbar supports: Bold, Italic, Underline, Headings (H1-H3), Bullet/Ordered lists, Links, Undo/Redo
- Content is saved as HTML and rendered via `dangerouslySetInnerHTML` on public pages
- Available in `text`, `html`, and `columns` section types

---

### 12.10 Tom Buck Guide (Strategy & Mentor Oversight)

**Login:** Admin credentials

**Tom's role focuses on strategy, mentor coordination, and platform oversight:**

| Action | Where | How |
|--------|-------|-----|
| View mentor pool | `/admin/users` (filter by role) | See all registered mentors, their types |
| Review mentor videos | `/admin/pillar-submissions` | Watch mentor-type-specific videos |
| Adjust matching algorithm | `/admin/match-settings` | Tune weights for mentor-innovator pairing |
| Configure AI scoring | `/admin/match-settings` | Toggle AI, adjust AI weight |
| Monitor match quality | Notifications + email | Receive quality match alerts (score >= 70) |
| Review innovator assessment results | `/admin/users` → view user detail | See innovator types 1-4 |
| Oversight of mentor registration | Mentor onboarding flow | Mentors select type, record video, complete Q&A |
| View match suggestions | `/innovator/matches/suggestions` (as admin via API) | See how AI scores + deterministic scoring blend |

**Mentor-innovator pairing logic:**

```
Innovator Type 1 (Explorer)  →  Psychologist mentor  (+15 scoring bonus)
Innovator Type 2 (Definer)   →  Professor mentor     (+15 scoring bonus)
Innovator Type 3 (Resolver)  →  Coach mentor         (+15 scoring bonus)
Innovator Type 4 (Implementer) → Coach mentor        (+15 scoring bonus)
```

**Tom's notification feed:** Receives `MENTOR_ALERT_EMAILS` (configured in `.env`):
- High-quality match notifications (score >= 70)
- New mentor registrations
- Mentor-type-specific activity

**Income stream concepts (not yet implemented):**
- Membership fee ($5)
- Mentor registration fee ($50)
- Funding facilitation fees
- Escrow service for mentor payments
- Business membership tier (post-1-year)

---

### 12.11 Notifications Reference

| Notification Type | Trigger | Recipient | Channel |
|-------------------|---------|-----------|---------|
| `resonance_welcome` | New registration | New user | In-app + email |
| `admin_new_user` | New registration | All admins | In-app |
| `pillar_submission` | Video submitted | All admins | In-app + email |
| `match` | Match created | Innovator | In-app + email |
| `match_accepted` | Match accepted | Innovator/mentor/investor | In-app |
| `quality_match` | Score >= 70 | Whitney + Tom | In-app + email |
| `story_review` | Story approved/rejected | Innovator | In-app |
| `message` | New message | Message recipient | In-app |

---

> This document is intended to be updated as the application evolves. Update the "Last updated" date and relevant sections with each significant change.
