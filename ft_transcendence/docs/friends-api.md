# Friends & online status — API contract (frontend)

Backend for the **Standard user management** module (friends + online).  
All routes go through the API gateway under `/api/v1` with:

```http
Authorization: Bearer <accessToken>
```

**Online rule:** a user is `isOnline: true` if `lastSeenAt` is within the last **90 seconds**.

---

## Presence (heartbeat)

Call this about every **30 seconds** while the app is open (logged-in shell).

```http
POST /api/v1/users/me/heartbeat
```

**200**

```json
{
  "lastSeenAt": "2026-07-25T20:30:00.000Z",
  "isOnline": true,
  "onlineThresholdSeconds": 90
}
```

---

## Friends

### List accepted friends

```http
GET /api/v1/users/me/friends
```

**200** — array of:

```json
{
  "id": "uuid",
  "userName": "Alice",
  "avatarUrl": "/uploads/avatars/....webp",
  "isOnline": true,
  "lastSeenAt": "2026-07-25T20:30:00.000Z",
  "friendshipId": "uuid",
  "status": "accepted"
}
```

`avatarUrl` / `lastSeenAt` may be omitted when null.

### Send friend request

```http
POST /api/v1/users/:userId/friends
```

- `:userId` = the other user’s id (from Community / public profile).
- **201** — `FriendUser` with `status: "pending"` (or `"accepted"` if they had already requested you — auto-accept).
- **400** self-friend  
- **404** user missing  
- **409** already friends / already requested  

### Remove friend (or cancel outgoing / reject by deleting)

```http
DELETE /api/v1/users/me/friends/:friendId
```

**204** empty body.

Works for accepted friendships and also removes a row if you pass the other party’s id for a pending relationship that exists in either direction… Prefer the request endpoints below for pending incoming.

---

## Friend requests

### List pending

```http
GET /api/v1/users/me/friend-requests
```

**200**

```json
{
  "incoming": [ /* FriendUser status pending — people who asked you */ ],
  "outgoing": [ /* FriendUser status pending — people you asked */ ]
}
```

### Accept

```http
POST /api/v1/users/me/friend-requests/:requesterId/accept
```

**200** — `FriendUser` with `status: "accepted"`.

### Reject

```http
POST /api/v1/users/me/friend-requests/:requesterId/reject
```

**204**

---

## Suggested frontend work

1. After login, start a heartbeat interval (clear on logout / unmount).
2. Community + public profile: **Add friend** → `POST /users/:id/friends`.
3. Friends page: `GET /users/me/friends` + online badge from `isOnline`.
4. Requests UI: incoming accept/reject + optional outgoing list.
5. Remove friend button → `DELETE /users/me/friends/:friendId`.

---

## Migration

User-service Prisma migration: `20260725213000_friends_online`  
Adds `users.last_seen_at` + `friendships` table.

After pull: rebuild/restart `user-service` (and gateway) so migrations apply.
