# SOL Hub — Security Audit Report

**Date:** June 29, 2026
**Scope:** Full codebase audit of `apps/api` (FastAPI backend) and `apps/web` (Next.js frontend)
**Auditor:** Automated code review against project security rules (AGENTS.md)

---

## Executive Summary

The codebase demonstrates strong security fundamentals in several areas: bcrypt password hashing, magic-byte file validation, UUID-renamed uploads, parameterized SQLAlchemy queries, explicit CORS origins, comprehensive security headers, rate limiting on auth endpoints, and a global exception handler that prevents stack trace leakage.

All **3 critical vulnerabilities** have been remediated. Of the 5 high-severity issues, all 5 have been fixed. Of the 6 medium-severity issues, 3 have been fixed (M2, M3, M6).

| Severity | Total | Fixed | Open |
|----------|-------|-------|------|
| CRITICAL | 3 | 3 | 0 |
| HIGH | 5 | 5 | 0 |
| MEDIUM | 6 | 3 | 3 |
| LOW | 4 | 0 | 4 |

---

## CRITICAL Findings

### C1. Privilege Escalation via Self-Role-Change — RESOLVED

**File:** `apps/api/src/routers/users.py:32-35` (original)
**CWE:** CWE-269 (Improper Privilege Management)
**Status:** FIXED June 29, 2026

The `PATCH /api/users/me` endpoint previously allowed any authenticated user to change their own `role` field, including escalating to `"admin"`:

```python
# REMOVED — was vulnerable
if body.role is not None:
    if body.role not in ("innovator", "mentor", "investor", "admin"):
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
    current_user.role = body.role  # <-- any user can become admin
```

**Impact:** Any authenticated user could grant themselves admin privileges, gaining full access to all admin endpoints (user management, role changes, account deletion, content moderation).

**Remediation applied:**
- Removed `role` field from `UpdateProfileRequest` schema (`apps/api/src/schemas/user.py`)
- Removed role-change logic from `PATCH /api/users/me` endpoint (`apps/api/src/routers/users.py`)
- Role changes can now only happen via the admin-only `PATCH /api/admin/users/{user_id}/role` endpoint (which requires `CurrentAdmin` dependency)

---

### C2. Weak / Default SECRET_KEY — RESOLVED

**Files:**
- `/.env:3` — `SECRET_KEY=change-this-to-a-random-secret`
- `apps/api/src/config.py:9` — `SECRET_KEY: str = "dev-secret"`

**CWE:** CWE-798 (Use of Hard-Coded Credentials)
**Status:** FIXED June 29, 2026

The JWT signing key defaults to `"dev-secret"` and the root `.env` contains a placeholder value. If deployed to production without overriding, an attacker who knows these defaults can forge valid JWT tokens for any user, including admin.

**Remediation applied:**
- Added startup guard in `apps/api/src/main.py` lifespan handler. The server now refuses to boot if `SECRET_KEY` is a known weak value (`"dev-secret"`, `"change-this-to-a-random-secret"`, or empty) and `ENVIRONMENT != "development"`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT != "development" and settings.SECRET_KEY in ("dev-secret", "change-this-to-a-random-secret", ""):
        raise RuntimeError("SECRET_KEY must be set to a strong random value in non-development environments")
    yield
```

- **Action still required:** ~Generate a cryptographically random key for production~ Key has been generated and set in `.env`. Verify the production environment uses a different strong key.

---

### C3. WebSocket Missing Workspace Authorization — RESOLVED

**File:** `apps/api/src/routers/workspace_ws.py:17-115` (original)
**CWE:** CWE-862 (Missing Authorization)
**Status:** FIXED June 29, 2026

The WebSocket endpoint authenticated the user via token but **did not verify workspace access**. It checked that the user existed and the project existed, but never checked if the user was the project innovator or part of an accepted match:

```python
# REMOVED — was vulnerable
async def workspace_ws(websocket: WebSocket, project_id: str, token: str = Query(...)):
    # ... token decoded, user_id extracted ...
    await websocket.accept()
    # ... NO workspace access check ...
    # user could send/receive messages in ANY project workspace
```

Compare with the REST endpoint `workspace.py:28-49` which correctly calls `_verify_workspace_access()`.

**Impact:** Any authenticated user could connect to any project workspace WebSocket, read private messages, and send messages to workspace members.

**Remediation applied:**
- Added workspace access verification before `websocket.accept()` in `workspace_ws.py`
- The check mirrors the REST `_verify_workspace_access()` logic: verifies user is either the project innovator or has an accepted match (as mentor or investor)
- Unauthenticated/unauthorized users are rejected with `WS_1008_POLICY_VIOLATION` before the connection is accepted
- Also added UUID validation for the `user_id` extracted from the JWT payload

```python
# Added authorization check (before websocket.accept())
async with get_db() as db:
    project = await db.execute(
        select(Project).where(Project.id == project_id, Project.is_deleted == False)
    )
    project = project.scalar_one_or_none()
    if not project:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if project.innovator_id != uid:
        match_result = await db.execute(
            select(Match).where(
                Match.project_id == project_id,
                Match.status == "accepted",
            )
        )
        authorized = any(
            m.mentor_id == uid or m.investor_id == uid
            for m in match_result.scalars().all()
        )
        if not authorized:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

await websocket.accept()
```

---

## HIGH Findings

### H1. Email Exposure in Member Directory — RESOLVED

**File:** `apps/api/src/schemas/member.py:9`
**Status:** FIXED June 29, 2026

`MemberResponse` previously included the `email` field, which was returned by `GET /api/members/` to any authenticated user:

```python
# REMOVED — was exposed
class MemberResponse(BaseResponseWithUUID):
    id: str
    full_name: str
    email: str  # <-- removed
    ...
```

**Impact:** Any authenticated user could harvest all member email addresses, enabling phishing or spam.

**Remediation applied:**
- Removed `email` field from `MemberResponse` schema in `apps/api/src/schemas/member.py`
- The field was already unused by the frontend; this is a purely server-side change

---

### H2. IDOR on Match Detail Endpoint — RESOLVED

**File:** `apps/api/src/routers/matches.py:201-234`
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
**Status:** FIXED June 29, 2026

`GET /api/matches/{match_id}` previously did not verify the requesting user is a participant in the match. Any authenticated user could view any match by ID, including notes and participant information.

```python
# REMOVED — was vulnerable
@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(match_id: uuid.UUID, db: DbSession, current_user: CurrentUser):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    # ... NO authorization check ...
    return MatchResponse(...)
```

**Remediation applied:**
- Added authorization check after fetching the match: verifies `current_user.id` is either `match.mentor_id`, `match.investor_id`, or the project innovator
- Admins bypass the check (same pattern as `update_match`)
- Unauthorized users receive 403 Forbidden

---

### H3. No File Size Limit on Uploads — RESOLVED

**Files:** `apps/api/src/routers/media.py`, `apps/api/src/routers/users.py`, `apps/api/src/routers/projects.py`, `apps/api/src/routers/workspace.py`
**Status:** FIXED June 29, 2026

All upload endpoints called `await file.read()` to read the entire file into memory without any size limit.

**Impact:** An attacker could upload arbitrarily large files, causing memory exhaustion (OOM) or filling S3/MinIO storage.

**Remediation applied:**
- Added `MAX_FILE_SIZE = 50 * 1024 * 1024` (50 MB) constant in `apps/api/src/utils/file_validator.py`
- Added `validate_file_size()` function that checks `UploadFile.size` and raises `413 REQUEST_ENTITY_TOO_LARGE` if exceeded
- Called `validate_file_size()` in all 5 upload endpoints: media upload, avatar upload, intro video upload, project attachment upload, workspace document upload

---

### H4. Stripe Demo Mode Active Without Safeguard — RESOLVED

**File:** `apps/api/src/routers/membership.py:46-53`
**Status:** FIXED June 29, 2026

When `STRIPE_SECRET_KEY` is empty, the checkout endpoint directly upgrades the user's membership tier without payment:

```python
# FIXED — now guarded with ENVIRONMENT check
if not settings.STRIPE_SECRET_KEY:
    if settings.ENVIRONMENT != "development":
        raise HTTPException(status_code=501, detail="Stripe is not configured")
    await _apply_tier(current_user, tier, db)
```

Additionally, `_apply_tier` previously created a new `Subscription` record each time, which would fail on the `user_id` unique constraint for repeat calls.

**Impact:** In production, if Stripe keys are accidentally omitted, any user could upgrade to any paid tier for free.

**Remediation applied:**
- Guarded demo mode with `settings.ENVIRONMENT == "development"` check — in production, returns 501 Not Implemented
- Fixed `_apply_tier` to upsert: checks for existing subscription and updates it instead of always creating a new one
- Made `_apply_tier` async (was sync but used async session)

---

### H5. Stripe Webhook Lacks Idempotency — RESOLVED

**File:** `apps/api/src/routers/membership.py:117-220`
**CWE:** CWE-367 (Time-of-Check Time-of-Use)
**Status:** FIXED June 29, 2026

The Stripe webhook handler previously did not track processed event IDs. If Stripe retried a webhook (which it does automatically), the same event could be processed multiple times, potentially creating duplicate records or performing duplicate state transitions.

**Remediation applied:**
- Created `WebhookEvent` model (`apps/api/src/models/webhook_event.py`) with `event_id` (unique, indexed), `event_type`, `source`, `payload`, and `created_at`
- Ran Alembic migration `e2f7b0d9c4a6` to create the `webhook_events` table
- Webhook handler now checks for existing `event_id` before processing and returns early if duplicate
- After successful processing, the event ID is recorded in `webhook_events`
- Also moved inline `import datetime` to top-level imports and consolidated `json` import

---

## MEDIUM Findings

### M1. WebSocket Token Passed in URL Query Parameter

**File:** `apps/api/src/routers/workspace_ws.py:18`

```python
async def workspace_ws(websocket: WebSocket, project_id: str, token: str = Query(...)):
```

The JWT token is passed as `?token=...` in the WebSocket URL. URLs are logged by reverse proxies, access logs, and may appear in browser history.

**Remediation:** Pass the token in the `Sec-WebSocket-Protocol` header or as the first message after connection. Alternatively, use a short-lived WebSocket-specific token exchanged via an authenticated REST call.

---

### M2. No Password Complexity Requirements — RESOLVED

**Files:** `apps/api/src/schemas/auth.py:8,31,37`
**Status:** FIXED June 29, 2026

Password fields previously accepted any string with no minimum length:

```python
class RegisterRequest(BaseModel):
    password: str = Field(min_length=8)  # added
```

**Remediation applied:** Added `min_length=8` to `password` fields in `RegisterRequest`, `ChangePasswordRequest.new_password`, and `ResetPasswordRequest.new_password`. The `LoginRequest` password field intentionally has no constraint (users with old short passwords must still be able to log in).

---

### M3. CORS_ORIGINS Not Overridable from Environment — RESOLVED

**File:** `apps/api/src/config.py:27-29`
**Status:** FIXED June 29, 2026

`CORS_ORIGINS` was defined as a `@property` that hardcoded `["http://localhost:3000"]`. Despite `.env` listing `CORS_ORIGINS=[...]`, the property shadowed any env var, making it impossible to configure production origins without code changes.

**Remediation applied:** Changed `CORS_ORIGINS` from a `@property` to a regular `List[str]` field with default `["http://localhost:3000"]`. pydantic-settings V2 automatically parses JSON-encoded list values from the environment, so `CORS_ORIGINS=["https://solhub.app"]` in `.env` now works correctly.

---

### M4. Membership Tier Not Enforced

No endpoint checks `current_user.membership_tier` before allowing actions. Free-tier users can create unlimited projects, groups, posts, and access all features identical to paid tiers.

**Remediation:** Add tier-based feature gating in relevant endpoints (e.g., limit project creation to `innovator+` tiers, limit group creation to paid tiers).

---

### M5. Draft Projects Visible to All Authenticated Users

**File:** `apps/api/src/routers/projects.py:85-93`

`GET /api/projects/{project_id}` returns any non-deleted project regardless of status. Draft projects are visible to all authenticated users, not just the owner.

**Remediation:** If `project.status == "draft"`, require `current_user.id == project.innovator_id` or `current_user.role == "admin"`.

---

### M6. Duplicate File Upload Utilities — RESOLVED

**Files:** `apps/api/src/utils/file.py` and `apps/api/src/utils/storage.py`
**Status:** FIXED June 29, 2026

Two S3 upload implementations existed:
- `storage.py` — the correct one: validates via `file_validator.py`, generates UUID filenames, sets `ACL=public-read`
- ~~`file.py`~~ — the legacy one: uses original filename extensions, does NOT set ACL, does NOT validate file type

**Remediation applied:** Deleted `apps/api/src/utils/file.py`. All upload endpoints import from `storage.py`.

---

## LOW Findings

### L1. Frontend Dependencies Use Caret Ranges

**File:** `apps/web/package.json`

All dependencies use `^` (caret ranges) instead of exact pinning. The project's security rules state: "Pin exact versions in package.json (no ^ or ~ in production)."

The `pnpm-lock.yaml` lockfile exists and mitigates this, but `package.json` itself should be pinned for production deployments.

---

### L2. S3 Credentials Default to `minioadmin`

**File:** `apps/api/src/config.py:14-15`

```python
S3_ACCESS_KEY: str = "minioadmin"
S3_SECRET_KEY: str = "minioadmin"
```

If deployed without overriding, the default MinIO credentials are used. These are publicly known defaults.

**Remediation:** Add a startup check that refuses to boot if S3 credentials are `minioadmin` and `ENVIRONMENT != "development"`.

---

### L3. Admin Seed Key Is a Placeholder

**File:** `apps/api/.env`

```
ADMIN_SEED_KEY=super-secret-admin-key-change-me
```

The admin seeding endpoint (`POST /api/admin/seed`) uses this key to authorize creating the first admin. The placeholder value is easily guessable.

**Remediation:** Replace with a cryptographically random value before any deployment. The seed endpoint can only be used once (existing admin check), but the key should still be strong.

---

### L4. Auth Token Stored in localStorage

**File:** `apps/web/src/lib/auth.tsx:87`

```typescript
localStorage.setItem("auth_token", accessToken);
```

JWT tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page (including XSS). The alternative (`httpOnly` cookies) is more secure but requires a different API architecture.

**Impact:** If an XSS vulnerability exists anywhere in the frontend, the auth token can be stolen. The CSP headers mitigate this significantly by restricting script sources.

**Remediation:** Consider migrating to `httpOnly` + `Secure` + `SameSite=Lax` cookies for token storage in a future refactor. For now, the strict CSP provides reasonable protection.

---

## Positive Findings (Compliant Areas)

| Area | Status | Details |
|------|--------|---------|
| Password Hashing | **PASS** | bcrypt via passlib (`security.py:9`) — not MD5/SHA |
| SQL Injection | **PASS** | All queries use SQLAlchemy ORM with parameterized queries — no raw SQL string concatenation |
| File Type Validation | **PASS** | `file_validator.py` reads magic bytes via `python-magic`, not file extension |
| File Renaming | **PASS** | Uploads renamed to UUIDs (`generate_storage_key`) — no original filenames in storage |
| CORS Configuration | **PASS** | Explicit origin allowlist (`["http://localhost:3000"]`), not `*`. Combined with `allow_credentials=True` (safe because origins are explicit) |
| Security Headers | **PASS** | CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy all set via `SecurityHeadersMiddleware` |
| Error Handling | **PASS** | Global exception handler returns generic `"Internal server error"` — no stack traces or SQL errors leaked |
| Rate Limiting | **PASS** | Login (10/min), Register (5/min), Forgot Password (3/hour), Reset Password (5/hour), Resend Verification (3/hour) |
| Stripe Webhook Signature | **PASS** | `stripe.Webhook.construct_event()` verifies signature before processing |
| XSS Prevention | **PASS** | No `dangerouslySetInnerHTML` anywhere in frontend. React auto-escapes all rendered content |
| Secrets in Frontend | **PASS** | `NEXT_PUBLIC_*` vars only contain non-secret values (API URL, Shapo widget ID, Plausible URL/domain, Stripe publishable key) |
| `.gitignore` | **PASS** | `.env` and `.env.local` are both ignored |
| Resource Ownership | **PASS** | Most endpoints verify `owner_id == current_user.id` (projects, posts, groups, resources, documents, group messages) |
| Admin Authorization | **PASS** | All `/api/admin/*` endpoints require `CurrentAdmin` dependency. Destructive operations require `is_super_admin` |
| Dependency Pinning (API) | **PASS** | `requirements.txt` pins all versions exactly (no `^`/`~`) |
| Lockfile Committed | **PASS** | `pnpm-lock.yaml` exists at root |

---

## Remediation Priority

| Priority | Finding | Effort | Status |
|----------|---------|--------|--------|
| ~~P0~~ | ~~C1: Remove `role` from `UpdateProfileRequest`~~ | ~~5 min~~ | **FIXED** |
| ~~P0~~ | ~~C2: Generate strong `SECRET_KEY` + startup guard~~ | ~~15 min~~ | **FIXED** |
| ~~P0~~ | ~~C3: Add workspace access check to WebSocket~~ | ~~15 min~~ | **FIXED** |
| ~~P1~~ | ~~H1: Remove `email` from `MemberResponse`~~ | ~~5 min~~ | **FIXED** |
| ~~P1~~ | ~~H2: Add authz check to `GET /matches/{id}`~~ | ~~10 min~~ | **FIXED** |
| ~~P1~~ | ~~H3: Add file size limit~~ | ~~15 min~~ | **FIXED** |
| ~~P1~~ | ~~H4: Guard demo mode with `ENVIRONMENT` check~~ | ~~10 min~~ | **FIXED** |
| ~~P2~~ | ~~H5: Add webhook idempotency table~~ | ~~30 min~~ | **FIXED** |
| **P2 — Fix soon** | M1: Move WS token from query param to header | 20 min | Open |
| ~~P2~~ | ~~M2: Add password min length~~ | ~~5 min~~ | **FIXED** |
| ~~P2~~ | ~~M3: Make `CORS_ORIGINS` env-configurable~~ | ~~10 min~~ | **FIXED** |
| **P3 — Backlog** | M4: Membership tier enforcement | Medium | Open |
| **P3 — Backlog** | M5: Draft project visibility | 15 min | Open |
| ~~P3~~ | ~~M6: Delete `file.py` dead code~~ | ~~2 min~~ | **FIXED** |
| **P3 — Backlog** | L1: Pin frontend dependency versions | 10 min | Open |
| **P3 — Backlog** | L2: S3 credential startup check | 10 min | Open |
| **P3 — Backlog** | L3: Admin seed key placeholder | 2 min | Open |
| **P3 — Backlog** | L4: Migrate from localStorage to httpOnly cookies | High effort | Open |

---

## Changelog

| Date | Change |
|------|--------|
| June 29, 2026 | Initial audit completed — 3 CRITICAL, 5 HIGH, 6 MEDIUM, 4 LOW findings |
| June 29, 2026 | C1 fixed: Removed `role` from `UpdateProfileRequest` and `PATCH /api/users/me` |
| June 29, 2026 | C2 fixed: Added SECRET_KEY startup guard in `main.py` lifespan; generated strong key in `.env` |
| June 29, 2026 | C3 fixed: Added workspace access verification to WebSocket endpoint in `workspace_ws.py` |
| June 29, 2026 | H1 fixed: Removed `email` from `MemberResponse` schema |
| June 29, 2026 | H2 fixed: Added authorization check to `GET /api/matches/{id}` |
| June 29, 2026 | H3 fixed: Added `MAX_FILE_SIZE` (50 MB) + `validate_file_size()` to all 5 upload endpoints |
| June 29, 2026 | H4 fixed: Guarded Stripe demo mode with `ENVIRONMENT` check; fixed `_apply_tier` upsert logic |
| June 29, 2026 | H5 fixed: Added `WebhookEvent` model + migration + idempotency check in webhook handler |
| June 29, 2026 | M2 fixed: Added `min_length=8` to all password fields in auth schemas |
| June 29, 2026 | M3 fixed: Changed `CORS_ORIGINS` from `@property` to env-configurable `List[str]` field |
| June 29, 2026 | M6 fixed: Deleted dead code `apps/api/src/utils/file.py` |

---

*End of report.*
