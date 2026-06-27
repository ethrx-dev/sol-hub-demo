# SOL Hub API Documentation

## Base URL

Development: `http://localhost:8000/api`

All routes are prefixed with `/api`. For example, the auth register endpoint is:
`POST http://localhost:8000/api/auth/register`

---

## Authentication

All protected endpoints require a Bearer JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login` or `POST /api/auth/register`.

### Admin Authentication

The first super admin is created via a one-time seed endpoint:

```bash
curl -X POST http://localhost:8000/api/admin/seed \
  -H "X-Admin-Secret: your-admin-seed-key" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@solhub.io","password":"Admin123!","full_name":"Super Admin"}'
```

This only works once — subsequent calls return `409 Conflict`. Requires `ADMIN_SEED_KEY` to be set in the API `.env`.

---

## Endpoint Groups

| Group         | Prefix               | Description                            |
|---------------|----------------------|----------------------------------------|
| Auth          | `/api/auth`          | Register, login, refresh, logout, password reset, me |
| Users         | `/api/users`         | Profile CRUD, onboarding               |
| Projects      | `/api/projects`      | Project CRUD, submit, milestones       |
| Matches       | `/api/matches`       | List, create, accept/decline           |
| Investments   | `/api/investments`   | Commit, list, financial report         |
| Feed          | `/api/feed`          | Social feed posts, comments, likes     |
| Posts         | `/api/posts`         | Posts CRUD                             |
| Messages      | `/api/messages`      | Direct messaging                       |
| Groups        | `/api/groups`        | Group CRUD, membership                 |
| Members       | `/api/members`       | Member directory                       |
| Resources     | `/api/resources`     | Resource library CRUD                  |
| Notifications | `/api/notifications` | User notification management           |
| Membership    | `/api/membership`    | Plans, Stripe checkout, webhooks       |
| Media         | `/api/media`         | File upload                            |
| Workspace     | `/api/projects/{id}/workspace` | Documents, messages          |
| Admin         | `/api/admin`         | Seed, stats, users, projects, matches  |

---

## Key Endpoint Details

### Register

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "innovator@example.com",
    "password": "securepassword",
    "full_name": "Jane Doe"
  }'
```

Notes:
- Role is always set to `"innovator"` on registration
- Returns `{ access_token, refresh_token, token_type }`
- Full name is snake_case: `full_name` (not `fullName`)

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "innovator@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJl...",
  "token_type": "bearer"
}
```

### Get Current User

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me
```

Response uses snake_case fields:
```json
{
  "id": "ae8da5fc-8ddd-4287-b575-f3ee748b4b83",
  "email": "admin@solhub.io",
  "full_name": "Super Admin",
  "avatar_url": null,
  "role": "admin",
  "onboarding_completed": true,
  "skills": [],
  "sectors_of_interest": [],
  "membership_tier": "free",
  "is_active": true,
  "created_at": "2026-06-27T02:33:57.716817Z",
  "updated_at": null
}
```

### Update Onboarding

```bash
curl -X PATCH http://localhost:8000/api/users/me \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "onboarding_completed": true,
    "bio": "Impact entrepreneur",
    "skills": ["Python", "React"],
    "sectors_of_interest": ["EdTech"]
  }'
```

### Create Project

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Project",
    "tagline": "One-line summary",
    "description": "Full description",
    "sector": "EdTech",
    "stage": "idea",
    "target_amount": 50000,
    "video_url": null,
    "team_members": [],
    "budget_breakdown": {}
  }'
```

### Admin: List Users

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/admin/users?skip=0&limit=20"
```

### Admin: Change User Role

```bash
curl -X PATCH http://localhost:8000/api/admin/users/{user_id}/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "mentor"}'
```

Valid roles: `innovator`, `mentor`, `investor`, `admin`

### Admin: Change Project Status

```bash
curl -X PATCH http://localhost:8000/api/admin/projects/{project_id}/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

Valid statuses: `draft`, `submitted`, `active`, `funded`, `completed`, `cancelled`

---

## Response Format

### Success

Endpoints return the direct model or a paginated wrapper:

```json
// Single item
{ "id": "...", "title": "...", ... }

// Paginated list
{ "items": [...], "total": 42, "skip": 0, "limit": 20 }
```

### Error

Errors follow FastAPI convention:

```json
{ "detail": "Error message" }

// Validation errors
{ "detail": [{ "loc": ["body", "email"], "msg": "field required", "type": "value_error.missing" }] }
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete, logout) |
| 400 | Bad Request / Validation Error |
| 401 | Not Authenticated (missing/invalid token) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 409 | Conflict (duplicate email, match, etc.) |
| 422 | Validation Error (request body) |

---

## Schema Conventions

- **Snake case** for all fields: `full_name`, `avatar_url`, `onboarding_completed`
- **UUIDs** are serialized as strings automatically (handled server-side by `BaseResponseWithUUID`)
- **Timestamps** are ISO 8601 with timezone: `2026-06-27T02:33:57.716817Z`
- **Pagination** uses `skip` and `limit` query parameters
