# Backend database contract

This backend branch intentionally does not modify `database/init` or add migration files. Apply the following migration before enabling authentication, uploads, or event participation in an environment.

```sql
ALTER TABLE users
    ADD COLUMN password_hash VARCHAR(255) NULL,
    ADD COLUMN avatar_url VARCHAR(255) NULL;

ALTER TABLE events
    ADD COLUMN image_url VARCHAR(255) NULL;

CREATE TABLE event_participants (
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, user_id),
    KEY event_participants_user_id_idx (user_id),
    CONSTRAINT event_participants_event_fk
        FOREIGN KEY (event_id) REFERENCES events (event_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT event_participants_user_fk
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

`password_hash` is intentionally nullable so existing seeded accounts remain valid rows. Only users created through `POST /api/v1/auth/register` have a password and can log in. Hashes are bcrypt values and must never be exposed by a query or API response.
