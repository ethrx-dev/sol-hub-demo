# SOL Hub — Feature Overview

> Version: 0.1.0 · Updated: 2026-07-14

---

## 1. Authentication & User Management

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Register** — Email + password + role selection (innovator/mentor/investor), membership agreement, verification email | `auth.py` | No |
| **Login** — Email/password, returns JWT access + refresh tokens | `auth.py` | No |
| **Refresh** — Rotate refresh token, revoke old one | `auth.py` | No |
| **Logout** — Revoke refresh token | `auth.py` | No |
| **Change password** — Requires current password | `auth.py` | Auth |
| **Forgot / Reset password** — Email link, rate-limited (3/hr, 5/hr) | `auth.py` | No |
| **Email verification** — Token-based, sent on register, resend option | `auth.py` | No |
| **Get current user** — JWT-protected profile endpoint | `auth.py` | Auth |
| **Update profile** — Full name, avatar, bio, skills, sectors, social links, etc. | `users.py` | Auth |
| **User search** — Search by name/email/skills | `users.py` | Admin |
| **Onboarding wizard** — Update onboarding step progress for new users | `users.py` | Auth |
| **Rate limiting** — SlowAPI on auth endpoints: register 5/min, login 10/min, forgot-pw 3/hr, reset-pw 5/hr | `rate_limit.py` | — |

## 2. Projects

| Feature | API Module | Gated |
|---------|-----------|-------|
| **CRUD** — Create, read, update, delete (soft) projects with title, description, sectors, target amount, SDG alignment | `projects.py` | Auth |
| **List** — Paginated, filterable by status, sector, innovator | `projects.py` | Auth |
| **Status workflow** — Draft → submitted → active → completed → archived | `projects.py` | Auth |
| **Image** — Upload/update project image | `projects.py` | Auth |
| **Milestones** — Per-project milestones with descriptions, funding targets, and completion toggles | `milestones.py` | Auth |

## 3. Matching

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Create match** — Pair a project with a mentor and/or investor | `matches.py` | Auth |
| **List matches** — All matches for current user (with eager-loaded project + user data) | `matches.py` | Auth |
| **Update status** — Accept or decline a match. Valid statuses: `accepted`, `declined` | `matches.py` | Auth |
| **Match suggestions** — Score users by sector + skill overlap (0-100), exclude already-matched, return top 20 | `matches.py` | Auth |

### Matching Rules
- Duplicates are per-role: a mentor match on a project doesn't block an investor match, and vice versa
- Declined matches are excluded from duplicate checks (can be re-matched)
- Only pending matches can transition to accepted or declined
- Accepted matches unlock workspace access

## 4. Workspace

| Feature | API Module | Gated |
|---------|-----------|-------|
| **View workspace** — Project info + documents + messages + member roster | `workspace.py` | Auth (match) |
| **Documents** — Upload, list (paginated), delete (soft) with file validation via magic bytes | `workspace.py` | Auth (match) |
| **Messages** — Send + list (paginated, with sender name join) | `workspace.py` | Auth (match) |
| **WebSocket** — Real-time message broadcast + typing/ping events via room `workspace:{project_id}` | `workspace_ws.py` | Auth (match) |
| **Capacity limit** — Max 5 active workspaces per user (owned projects + accepted matches) | `workspace.py` | — |
| **Notifications** — DB notification + email on new workspace messages | `workspace.py` | — |

## 5. Investments

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Create investment** — Investor commits to a project with an amount | `investments.py` | Auth (investor) |
| **List project investments** — All investments for a given project | `investments.py` | Auth (match) |
| **My investments** — Current user's investment history | `investments.py` | Auth (investor) |
| **Stripe integration** — Payment intent creation, webhook handling with signature verification + idempotency | `investments.py` | — |

## 6. Feed & Social

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Feed posts** — CRUD with images, project links | `feed.py` | Auth |
| **Feed timeline** — Paginated, chronologically sorted | `feed.py` | Auth |
| **Comments** — Post comments (CRUD) | `feed.py` | Auth |
| **Likes** — Toggle like on posts | `feed.py` | Auth |
| **Groups** — CRUD with members, join/leave, group images | `groups.py` | Auth |
| **Group messages** — Real-time group chat via REST | `groups.py` | Auth |
| **Members directory** — Browse users with profile details | `members.py` | Auth |
| **Connections** — Follow/unfollow users, list followers/following | `connections.py` | Auth |

## 7. Content & Pages

| Feature | API Module | Gated |
|---------|-----------|-------|
| **CMS pages** — Dynamic pages (home, about, what-we-do, innovators, contact, donate, blog) managed via admin | `pages.py` | No |
| **Revision history** — Page edits tracked with rollback | `pages.py` | Admin |
| **Admin pages UI** — Create, edit, publish/unpublish pages with rich content | `admin_pages.py` | Admin |
| **Admin media library** — Upload, browse, and reuse media across pages | `admin_media.py` | Admin |
| **Contact form** — Email/name/message → notification email | `contact.py` | No |
| **Blog** — Post CRUD with categories, rich content | `blog.py` | Auth |
| **Events** — Create, list, RSVP | `events.py` | Auth |
| **Galleries** — Albums with multiple media items (images/video) | `galleries.py` | Auth |
| **Document library** — Categorized documents (PDFs, resources) with download tracking | `doc_library.py` | Auth |

## 8. Media & Storage

| Feature | API Module | Gated |
|---------|-----------|-------|
| **File upload** — Generic media upload, validates MIME via python-magic (magic bytes), renames to UUID | `media.py` | Auth |
| **Avatar upload** — User profile image | `media.py` | Auth |
| **Video upload** — Supports MP4/MOV, validated | `media.py` | Auth |
| **Storage backend** — MinIO/S3 (boto3), configurable endpoint, path-style addressing, s3v4 signatures | `storage.py` | — |
| **File validation** — Allowed: JPEG, PNG, GIF, WebP, MP4, MOV, PDF, DOCX, TXT. Max 50 MB. Magic byte check (not extension) | `file_validator.py` | — |

## 9. Notifications

| Feature | API Module | Gated |
|---------|-----------|-------|
| **In-app notifications** — Created on message, match, investment, etc. | `notifications.py` | Auth |
| **Preferences** — Per-user opt-in/opt-out for email categories | `notification_preferences.py` | Auth |
| **Email sending** — Via Resend API (send_welcome, send_verification, send_password_reset, send_message_notification) | `email.py` | — |
| **Notification types** — `message`, `match`, `investment`, `system` | `notifications.py` | — |

## 10. Search

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Global search** — Full-text search across projects, users, resources, feed posts, and blog posts | `search.py` | Auth |

## 11. Activity Log

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Activity feed** — Chronological log of user actions (project created, match accepted, investment made, etc.) | `activity.py` | Auth |
| **Automatic logging** — Key mutations log to `activity_log` table automatically | `activity.py` | — |

## 12. Pillars (SOL Model)

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Pillar submissions** — Members submit video/reflection against SOL pillars | `pillars.py` | Auth |
| **List submissions** — View own submissions + admin can view all | `pillars.py` | Auth |

## 13. Membership

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Membership agreement** — Required on register, timestamped acceptance | `membership.py` | No |
| **Subscription tiers** — Basic / premium (future: Stripe recurring) | `subscription.py` | Auth |

### Donations (Feature 7 — Donation Page Activation)
One-time donations are captured via a Stripe webhook (`mode="payment"`) and recorded in the `donations` table. The handler verifies the Stripe signature, is idempotent (tracks processed event IDs to skip duplicates), creates a `Donation` row (amount, currency, donor email, Stripe event/charge IDs), and notifies admins. Stripe keys are optional — without `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` the webhook returns `501 Not Implemented`.

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Donate** — Public one-time donation via Stripe (Checkout / payment element) | `membership.py` (webhook) | No |
| **Webhook** — `mode="payment"`, signature-verified, idempotent, writes `Donation` | `membership.py` | No |
| **Donations list (admin)** — Paginated list + total count + total amount | `admin.py` | Admin |

## 14. Admin Panel

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Seed super admin** — Bootstrap first admin via `X-Admin-Secret` header | `admin.py` | Admin |
| **User management** — List, change role, deactivate, grant super admin | `admin.py` | Admin |
| **Group management** — List/manage all groups | `admin.py` | Admin |
| **Post management** — List/manage all feed posts | `admin.py` | Admin |
| **Resource management** — List/manage all resources | `admin.py` | Admin |
| **Project status** — Admin override of project status | `admin.py` | Admin |
| **CMS pages** — Create/edit/publish/unpublish all CMS pages with revision history | `admin_pages.py` | Admin |
| **Admin media** — Full media library management | `admin_media.py` | Admin |
| **Donations dashboard** — Paginated donations list, total count + total amount | `admin.py` | Admin |

## 15. Resources

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Resource library** — Curated links/docs with categories | `resources.py` | Auth |
| **CRUD** — Create, read, update, delete | `resources.py` | Auth |

## 16. Affiliate Tracking

| Feature | API Module | Gated |
|---------|-----------|-------|
| **Create affiliate code** — Generate unique referral code per user (max 1 active) | `affiliate.py` | Auth |
| **My code** — Retrieve own active code | `affiliate.py` | Auth |
| **Track click** — Log referral click (IP, UA, referrer) | `affiliate.py` | No |
| **Track conversion** — Log referred user registration | `affiliate.py` | No |
| **Stats** — Total clicks, conversions, conversion rate | `affiliate.py` | Auth |

## 17. Security & Infrastructure

| Feature | Middleware / Config | Scope |
|---------|-------------------|-------|
| **Security headers** — CSP, HSTS (1 year), XFO (DENY), X-Content-Type-Options, Referrer-Policy on every response | `security.py` | Global |
| **HTTPS redirect** — 307 redirect when `x-forwarded-proto` is `http` (non-dev only) | `main.py` | Global |
| **CORS** — Explicit allowlist (no `*` wildcard with credentials) | `main.py` | Global |
| **Rate limiting** — SlowAPI on sensitive routes, default configurable | `rate_limit.py` | Per-route |
| **Secrets validation** — Lifespan hook rejects weak SECRET_KEY / S3 credentials in production | `main.py` | Startup |
| **Startup guard** + **Config model validator** — Double validation of env secrets | `config.py` | Startup |
| **File upload safety** — Magic byte MIME detection, UUID rename, 50 MB max, separate storage domain | `file_validator.py` | Per-upload |
| **SQL injection prevention** — All queries via SQLAlchemy ORM (no raw SQL) | All models | Global |
| **Stripe webhook security** — Signature verification + event idempotency (WebhookEvent model) | `investments.py` | Per-webhook |

## 18. Background Jobs (Worker)

| Feature | Module | Schedule |
|---------|--------|----------|
| **Send email** | `celery` task | On demand |
| **Process video upload** | `celery` task | On demand |
| **Run matching algorithm** | `celery` task | On demand |
| **Send notification** | `celery` task | On demand |
| **Cleanup expired tokens** | `celery` beat | Every 24h |
| **Generate project report** | `celery` task | On demand |

## 19. Feature Flags

Controlled via `ENABLED_FEATURES` env var. Currently gate the optional modules:
`connections`, `forums`, `events`, `galleries`, `document_library`, `blog`, `reporting`

Enabled by default on both dev and `dev.spacesoflearning.com`.

## 20. Frontend (Web)

| Feature | Details |
|---------|---------|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript strict |
| **CSS** | Tailwind v4 via `@tailwindcss/postcss` (PostCSS plugin; `experimental.useLightningcss` is intentionally disabled because LightningCSS conflicts with PostCSS plugins) |
| **State** | Zustand (auth, notifications, tour) |
| **Auth** | JWT stored in localStorage, auto-check on mount, `ProtectedRoute` wrapper |
| **API client** | Fetch wrapper with auto-refresh on 401 |
| **Admin UI** | Dashboard for users, groups, posts, resources, CMS pages, media, donations |
| **Pages** | Public: home, about, what-we-do, innovators, contact, donate, blog, page/* |
| **Dashboard** | Projects, matches, workspace, investments, feed, profile |
