# transcendence


`resource` - user journey: [https://miro.com/welcomeonboard/REhQTURqVEI0Tm1oQ2lNTzNOeTNlOHI0czkvVTFFZ3luc2dqNXUrcURWdGFITHcrSE1RR2creHNLd2lDaHRwS1IwMUtSandUSXRYbU5jakRZbUl4TFhPWHRyWXlMcWZYMlZ1djl1S2VGVEtjc2E2bC9pZlRvaytnUWRPWjVZWndhWWluRVAxeXRuUUgwWDl3Mk1qRGVRPT0hdjE=?share_link_id=955325343219](https://miro.com/welcomeonboard/REhQTURqVEI0Tm1oQ2lNTzNOeTNlOHI0czkvVTFFZ3luc2dqNXUrcURWdGFITHcrSE1RR2creHNLd2lDaHRwS1IwMUtSandUSXRYbU5jakRZbUl4TFhPWHRyWXlMcWZYMlZ1djl1S2VGVEtjc2E2bC9pZlRvaytnUWRPWjVZWndhWWluRVAxeXRuUUgwWDl3Mk1qRGVRPT0hdjE=?share_link_id=955325343219)

#### 🎨 Custom Design System & Reusable Components
We have built a dedicated custom design system with centralized tokens and reusable React UI components located in `frontend/src/components/` and documented in [`frontend/src/design-system/README.md`](file:///Users/wuerxuan/code/transcendence/ft_transcendence/frontend/src/design-system/README.md).
- **Centralized Tokens**: Colors, typography, shadows, and radii defined in `:root` (`index.css`).
- **Icon Set**: Custom SVG sprite & 26 named icon components in `Icon.tsx`.
- **10 Reusable UI Components**: `Button`, `Input`, `Select`, `Avatar`, `Badge`, `Card`, `Modal`, `EmptyState`, `Alert`, `Icon`.

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

other Gateway Endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Gateway health check |
| GET | `/metrics` | Prometheus metrics |
| GET | `/api/v1/status` | Gateway plus user/event service health summary |
| GET | `/uploads/:category/:filename` | Publicly serve saved avatar/event images |
| GET | `/docs` | Swagger UI |
<<<<<<< HEAD
=======

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
>>>>>>> 0a9f8e4 (README updated with information about gmail_app_password for alerting.)
