# Database Paths and Loading Flow

This folder contains the MySQL image definition and schema bootstrap files.

## Folder map

- `database/Dockerfile`
  - Builds the MySQL image used by Docker Compose.
  - Copies initialization scripts into `/docker-entrypoint-initdb.d/`.

- `database/init/001_users.sql`
  - Creates and seeds the `users` table used by user-service.

- `database/init/002_events.sql`
  - Creates and seeds the `events` table used by event-service.
  - Loaded after `users` to preserve foreign-key order.

## Runtime wiring

- `docker-compose.yml` -> `services.database.build.context: ./database`
- MySQL container startup runs files from `/docker-entrypoint-initdb.d/`
- SQL files are loaded in lexical order (`001_`, `002_`, ...)

## Service-side database modules

User service:
- `services/user-service/src/database/pool.ts`
- `services/user-service/src/database/health.ts`
- `services/user-service/src/database/index.ts` (entry point)

Event service:
- `services/event-service/src/database/pool.ts`
- `services/event-service/src/database/health.ts`
- `services/event-service/src/database/index.ts` (entry point)

## Notes

- In TypeScript projects, `index.ts` is the common equivalent of a Python `__init__.py` style folder entry.
- If schema changes are not appearing, recreate DB volume:
  - `docker compose down -v`
  - `docker compose up --build`