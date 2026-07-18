CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(36) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    creator_id VARCHAR(36) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    category VARCHAR(100) NULL,
    description TEXT NULL,
    location VARCHAR(255) NULL,
    comment TEXT NULL,
    min_participant INT NULL,
    safety_check BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id),
    KEY events_creator_id_idx (creator_id),
    CONSTRAINT events_creator_id_fk
        FOREIGN KEY (creator_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT events_time_range_chk
        CHECK (end_time >= start_time)
);

INSERT INTO events (
    event_id,
    event_name,
    creator_id,
    start_time,
    end_time,
    description,
    safety_check
)
VALUES
    ('www', 'event-01', '1', '2030-01-01 10:00:00', '2030-01-01 12:00:00', 'test event 01', FALSE),
    ('eee', 'event-02', '2', '2030-01-02 10:00:00', '2030-01-02 12:00:00', 'test event 02', FALSE),
    ('rrr', 'event-03', '3', '2030-01-03 10:00:00', '2030-01-03 14:00:00', 'test event 03', TRUE)
ON DUPLICATE KEY UPDATE
    event_name = VALUES(event_name),
    creator_id = VALUES(creator_id),
    start_time = VALUES(start_time),
    end_time = VALUES(end_time),
    description = VALUES(description),
    safety_check = VALUES(safety_check);
