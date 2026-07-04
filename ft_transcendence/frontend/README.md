# Test Frontend

React + Vite UI for manually exercising the api-gateway and microservices.

## Prerequisites

Start all backend services first:

```bash
# Terminal 1 — user service (:3001)
cd services/user-service && npm install && npm run dev

# Terminal 2 — event service (:3002)
cd services/event-service && npm install && npm run dev

# Terminal 3 — api gateway (:3000)
cd apps/api-gateway && npm install && npm run dev
```

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Events** — list, detail, create, update, delete via `/api/v1/events`
- **Users** — list, register, profile view, update, delete via `/api/v1/users`
- **Login** — pick a mock user or register; stores id in `localStorage` and sends it as `x-user`
- **Status** — gateway health and downstream service checks

Requests are proxied through Vite to `http://localhost:3000` (see `vite.config.ts`).

## Auth note

Real JWT auth is not implemented yet. Mutating endpoints require an `x-user` header matching the acting user. Select a user on the Login tab before creating/updating/deleting resources.
