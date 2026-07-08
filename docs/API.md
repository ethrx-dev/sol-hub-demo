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
| Auth          | `/api/auth`          | Register, login, refresh, logout, password reset, verify email, me |
| Users         | `/api/users`         | Profile CRUD, onboarding, avatar, video, notification-preferences |
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
| Milestones    | `/api/projects/{id}/milestones` | Create, list project milestones       |
| Events        | `/api/events`        | CRUD, RSVP, list upcoming/past         |
| Galleries     | `/api/galleries`     | Albums CRUD, album media, media upload, feed-media |
| Blog          | `/api/blog`          | Posts CRUD, categories, public listing |
| Forums        | `/api/forums`        | Categories, threads, replies           |
| Connections   | `/api/connections`   | Follow/unfollow, list followers/following |
| Activity      | `/api/activity`      | Timeline feed                          |
| Search        | `/api/search`        | Global search across entities          |
| Contact       | `/api/contact`       | Contact form submission                |
| Doc Library   | `/api/doc-library`   | Document CRUD                          |
| Pillars       | `/api/pillars`       | Video submissions (innovators, mentors, investors) |
| Pages         | `/api/pages`         | CMS page CRUD                          |
| Moderation    | `/api/moderation`    | Report content, block users            |
| Membership    | `/api/membership`    | Plans, Stripe checkout, webhooks       |
| Media         | `/api/media`         | File upload (images, documents)         |
| Workspace     | `/api/projects/{id}/workspace` | Documents, messages          |
| Workspace WS  | `ws://.../api/ws/workspace/{id}` | Real-time messaging (token in `Sec-WebSocket-Protocol`) |
| Admin         | `/api/admin`         | Seed, stats, users, projects, matches, groups, posts, resources, media, pages, pricing, blog, pillar-submissions, reports |

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

### Contact Form

```bash
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Partnership inquiry",
    "message": "I would like to partner with SOL Hub..."
  }'
```

Sends admin notification + confirmation email (if `RESEND_API_KEY` is set).

### Events

```bash
# List upcoming events
curl "http://localhost:8000/api/events?upcoming=true&limit=20"

# Create event (requires auth)
curl -X POST http://localhost:8000/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo Day",
    "description": "Showcase your project",
    "start_time": "2026-08-15T14:00:00Z",
    "end_time": "2026-08-15T17:00:00Z",
    "location": "123 Main St",
    "is_virtual": false,
    "max_attendees": 50,
    "status": "published"
  }'

# RSVP to an event
curl -X POST http://localhost:8000/api/events/{event_id}/rsvp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "going"}'
```

### Galleries (Albums)

```bash
# Create album
curl -X POST http://localhost:8000/api/galleries/albums \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Community Meetup", "description": "Photos from the event", "album_type": "photo"}'

# Upload media to album (multipart)
curl -X POST http://localhost:8000/api/galleries/albums/{album_id}/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@photo.jpg"

# List albums
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/galleries/albums?limit=20"

# Get album detail (with media)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/galleries/albums/{album_id}"
```

### Blog

```bash
# List published posts
curl "http://localhost:8000/api/blog/posts?limit=10"

# Get blog post
curl "http://localhost:8000/api/blog/posts/{post_id}"

# Create post (admin only)
curl -X POST http://localhost:8000/api/admin/blog/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Blog Post",
    "content": "Full markdown content...",
    "excerpt": "Short summary",
    "published": true
  }'
```

### Forums

```bash
# List categories
curl "http://localhost:8000/api/forums/categories"

# List threads in a category
curl "http://localhost:8000/api/forums/categories/{category_id}/threads"

# Create thread
curl -X POST http://localhost:8000/api/forums/categories/{category_id}/threads \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Discussion topic", "content": "Let me start..."}'

# Reply to thread
curl -X POST http://localhost:8000/api/forums/threads/{thread_id}/replies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great point!"}'
```

### Global Search

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/search?q=climate&limit=20"
```

Searches across: projects, users, posts, groups, resources, and events.

### Pillar Video Submissions

```bash
# Submit a video introduction for a pillar
curl -X POST http://localhost:8000/api/pillars/{pillar}/submit \
  -H "Authorization: Bearer <token>" \
  -F "video=@intro.mp4"
```

Pillar values: `innovators`, `mentors`, `investors`

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

### Admin: List/Manage Groups (super admin)

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:8000/api/admin/groups"
curl -X DELETE "http://localhost:8000/api/admin/groups/{group_id}" -H "Authorization: Bearer <token>"
```

### Admin: List/Manage Posts (super admin)

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:8000/api/admin/posts"
curl -X DELETE "http://localhost:8000/api/admin/posts/{post_id}" -H "Authorization: Bearer <token>"
```

### Admin: List/Manage Resources (super admin)

```bash
curl -H "Authorization: Bearer <token>" "http://localhost:8000/api/admin/resources"
curl -X DELETE "http://localhost:8000/api/admin/resources/{resource_id}" -H "Authorization: Bearer <token>"
```

### Admin: Toggle Super Admin

```bash
curl -X POST "http://localhost:8000/api/admin/users/{user_id}/toggle-super-admin" \
  -H "Authorization: Bearer <token>"
```

### Admin: Delete User (deactivate)

```bash
curl -X DELETE "http://localhost:8000/api/admin/users/{user_id}" \
  -H "Authorization: Bearer <token>"
```

### Admin: Change Project Status

```bash
curl -X PATCH http://localhost:8000/api/admin/projects/{project_id}/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

Valid statuses: `draft`, `submitted`, `active`, `funded`, `completed`, `cancelled`

### Milestones

```bash
# List milestones for a project
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/projects/{project_id}/milestones"

# Create a milestone
curl -X POST http://localhost:8000/api/projects/{project_id}/milestones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MVP Launch",
    "description": "Launch minimum viable product",
    "due_date": "2026-09-01",
    "budget": 15000
  }'
```

### Notification Preferences

```bash
# Get preferences (auto-creates defaults if missing)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/users/me/notification-preferences"

# Update preferences
curl -X PATCH http://localhost:8000/api/users/me/notification-preferences \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email_messages": false,
    "in_app_messages": true,
    "email_matches": true,
    "in_app_matches": true
  }'
```

Available toggle groups: `messages`, `matches`, `group_activity`, `project_updates` — each has an `email_*` and `in_app_*` variant.

### Media Upload

```bash
curl -X POST http://localhost:8000/api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg"
```

Returns `{"url": "/uploads/uuid-filename.jpg", "filename": "uuid-filename.jpg", "content_type": "image/jpeg", "size": 12345}`.

### Avatar & Video Upload

```bash
# Upload avatar
curl -X POST http://localhost:8000/api/users/me/avatar \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg"

# Upload intro video
curl -X POST http://localhost:8000/api/users/me/video \
  -H "Authorization: Bearer <token>" \
  -F "file=@intro.mp4"
```

### Feed Posts

```bash
# Create a feed post
curl -X POST http://localhost:8000/api/feed/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Excited to launch our prototype!",
    "media_urls": ["/uploads/image1.jpg"]
  }'

# List feed posts (paginated)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/api/feed/posts?skip=0&limit=20"
```

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
| 429 | Rate Limited (retry after window) |

---

## Rate Limiting

Auth endpoints are rate-limited via slowapi:

| Endpoint | Limit |
|----------|-------|
| POST /api/auth/register | 5 requests per minute |
| POST /api/auth/login | 10 requests per minute |
| POST /api/auth/forgot-password | 3 requests per hour |
| POST /api/auth/reset-password | 5 requests per hour |

## WebSocket

Workspace messaging uses WebSocket at:

```
ws://localhost:8000/api/ws/workspace/{project_id}
```

The JWT token is passed via the `Sec-WebSocket-Protocol` header (not as a URL query parameter):

```javascript
const ws = new WebSocket(url, [token]);
```

Messages are JSON with `type`, `sender_id`, `sender_name`, `content`, and `timestamp` fields.

Only authorized workspace participants (project owner, accepted mentor/investor) can connect.

## Schema Conventions

- **Snake case** for all fields: `full_name`, `avatar_url`, `onboarding_completed`
- **UUIDs** are serialized as strings automatically (handled server-side by `BaseResponseWithUUID`)
- **Timestamps** are ISO 8601 with timezone: `2026-06-27T02:33:57.716817Z`
- **Pagination** uses `skip` and `limit` query parameters
