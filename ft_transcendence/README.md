# transcendence

## `main`

this is the **production branch**
Everything comes to `/main` need to be fully tested, ready for eval already

## `dev`

all feature branches should branch off from `dev` merge back to `dev` with pull request use `feat/xxx` as branch name

### `backend`

- `/services`
- `/api-gateway`
- `docker yml/yaml`

### `frontend`

`resource` - user journey: [https://miro.com/welcomeonboard/REhQTURqVEI0Tm1oQ2lNTzNOeTNlOHI0czkvVTFFZ3luc2dqNXUrcURWdGFITHcrSE1RR2creHNLd2lDaHRwS1IwMUtSandUSXRYbU5jakRZbUl4TFhPWHRyWXlMcWZYMlZ1djl1S2VGVEtjc2E2bC9pZlRvaytnUWRPWjVZWndhWWluRVAxeXRuUUgwWDl3Mk1qRGVRPT0hdjE=?share_link_id=955325343219](https://miro.com/welcomeonboard/REhQTURqVEI0Tm1oQ2lNTzNOeTNlOHI0czkvVTFFZ3luc2dqNXUrcURWdGFITHcrSE1RR2creHNLd2lDaHRwS1IwMUtSandUSXRYbU5jakRZbUl4TFhPWHRyWXlMcWZYMlZ1djl1S2VGVEtjc2E2bC9pZlRvaytnUWRPWjVZWndhWWluRVAxeXRuUUgwWDl3Mk1qRGVRPT0hdjE=?share_link_id=955325343219)

### `database`



### Structure of README - TODO

The very first line must be italicized and read:
*This project has been created as part of the 42 curriculum by xxx, xxx, xxx*

A **Description** section that clearly presents the project, including its goal and a brief overview.

An **Instructions** section containing any relevant information about compilation,
installation, and/or execution.

A **Resources** section listing classic references related to the topic (documen-
tation, articles, tutorials, etc.), as well as a description of how AI was used —
specifying for which tasks and which parts of the project.

The React development frontend is available at [http://localhost:8080](http://localhost:8080).
It forwards `/api` and `/uploads` requests to the API gateway at
[https://localhost:3000](https://localhost:3000). The browser-facing frontend
is intentionally HTTP in local development; the gateway, user service, event
service, and database connections use TLS. When running Vite outside Docker,
trust the local CA or set `NODE_EXTRA_CA_CERTS=.certificates/ca/ca.crt`.
Protected endpoints require:
Authorization: Bearer 
API gateway — public API
**Base path: /api/v1**


| Method | Endpoint                        | JWT     | Purpose                                                              |
| ------ | ------------------------------- | ------- | -------------------------------------------------------------------- |
| POST   | `/auth/register`                | No      | Create an account. Body: `{ userName, email, password }`             |
| POST   | `/auth/login`                   | No      | Log in. Body: `{ email, password }`. Returns `{ accessToken, user }` |
| GET    | `/events`                       | No      | List public events                                                   |
| GET    | `/events/:eventId`              | No      | Get one event                                                        |
| POST   | `/events`                       | Yes| Create an event                                                      |
| PUT    | `/events/:eventId`              | Yes     | Update an event; owner only                                          |
| DELETE | `/events/:eventId`              | Yes     | Delete an event; owner only                                          |
| POST   | `/events/:eventId/join`         | Yes     | Join an event                                                        |
| DELETE | `/events/:eventId/join`         | Yes     | Cancel a join                                                        |
| GET    | `/events/:eventId/joined-count` | Yes     | Owner gets joined-user count                                         |
| POST   | `/events/:eventId/image`        | Yes     | Upload/replace event image; multipart field name: `file`             |
| GET    | `/users`                        | Yes     | List users                                                           |
| GET    | `/users/:userId`                | No      | View a public user profile                                           |
| PUT    | `/users/:userId`                | Yes     | Update own profile                                                   |
| DELETE | `/users/:userId`                | Yes     | Delete own profile                                                   |
| POST   | `/users/me/avatar`              | Yes     | Upload/replace own avatar; multipart field name: `file`              |
| GET    | `/users/me/events`              | Yes     | List events joined by current user                                   |

### Public API (`/api/v1/public`) — API key + rate limit

External clients use this surface (separate from JWT app routes).

- **Auth:** header `X-API-Key` = `PUBLIC_API_KEY` from `.env`
- **Rate limit:** 100 requests per minute per client (HTTP 429 when exceeded)
- **Mutations:** also send `X-User-Id` (UUID of the acting user who owns the event)
- **Docs:** Swagger UI at `/docs` → tag **public**

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| GET | `/api/v1/public/events` | List events |
| GET | `/api/v1/public/events/:eventId` | Get one event |
| POST | `/api/v1/public/events` | Create event |
| PUT | `/api/v1/public/events/:eventId` | Update event |
| DELETE | `/api/v1/public/events/:eventId` | Delete event |
| GET | `/api/v1/public/users/:userId` | Get public user profile |

other Gateway Endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Gateway health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/v1/status` | Gateway plus user/event service health summary |
| GET | `/uploads/:category/:filename` | Publicly serve saved avatar/event images |
| GET | `/docs` | Swagger UI |

## Email Notifications Setup

Alertmanager uses a Gmail App Password to send email notifications.

Before running the project:

1. Copy the example secret:

```bash
cp .secrets/gmail_app_password_example .secrets/gmail_app_password
```

2. Open `.secrets/gmail_app_password` and replace:

```text
<FILL_IN_YOUR_GMAIL_APP_PASSWORD>
```

with your own 16-character Gmail App Password.

> **Note:** The real `gmail_app_password` file is ignored by Git and must never be committed.

## Backups and disaster recovery

Health checks live on the gateway and services (`GET /health`, `GET /health/db`, `GET /api/v1/status`).
Automated backups are handled by the **`db-backup`** Compose service.

### What is backed up

- **MySQL** — full logical dump over TLS (`mysqldump --ssl-mode=REQUIRED`) → `backups/mysql-full-<timestamp>.sql.gz`
- **Uploads** (avatars / event images) — if present under `apps/api-gateway/uploads` → `backups/uploads-<timestamp>.tar.gz`
- Old files older than `BACKUP_RETENTION_DAYS` (default **7**) are deleted automatically

### Schedule

- On start, `db-backup` runs one backup immediately, then every `BACKUP_INTERVAL_SECONDS` (default **86400** = 24h).
- Configure both vars in `.env` (see `.env.example`).

### Manual backup / restore

```bash
# One-shot backup (stack must be able to reach the database)
make backup

# List dumps
ls -lah backups/

# Restore MySQL from a dump (OVERWRITES databases)
make restore FILE=backups/mysql-full-YYYYMMDDTHHMMSSZ.sql.gz

# Then restart app services
docker compose restart user-service event-service api-gateway
```

### If the database dies (runbook)

1. Confirm health: `curl -k https://localhost:3000/api/v1/status` and/or `docker compose ps`
2. Pick the newest good dump in `./backups/`
3. Bring MySQL back if needed: `docker compose up -d database` (wait until healthy)
4. Restore: `make restore FILE=backups/mysql-full-....sql.gz`
5. Restart services: `docker compose restart user-service event-service api-gateway`
6. Optional uploads: `tar -xzf backups/uploads-....tar.gz -C apps/api-gateway`
7. Re-check `/health` and log in to verify data

Dump files under `backups/` are gitignored — keep copies off-machine for real disasters.
