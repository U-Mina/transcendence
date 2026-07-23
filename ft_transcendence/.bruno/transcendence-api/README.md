# Transcendence API — Bruno collection

Tests for `http://localhost:3000/api/v1` covering auth, users, events, and user↔event cross-service rules.

## Open in Bruno

1. Bruno → Open Collection → select this folder (`.bruno/transcendence-api`)
2. Environment dropdown → **Local**
3. Run **00-setup / Init run variables** first
4. Run the rest in order (or Collection Runner)

## Folder map

| Folder | What it covers |
|--------|----------------|
| `00-setup` | Unique emails + future start/end times |
| `01-auth` | Register / login happy + invalid password / duplicate email |
| `02-users` | Profile CRUD, missing/invalid token, update someone else |
| `03-events` | Event CRUD, public list/get, invalid times |
| `04-cross-service` | Invalid token cannot create event; non-owner cannot update/delete; owner cannot join; joiner can join/leave; joined-count owner-only |
| `05-cleanup` | Delete event + optional user deletes |

## Expected auth failures

Protected routes without / with bad JWT should return **401**:

```json
{ "error": "Invalid or expired access token." }
```
