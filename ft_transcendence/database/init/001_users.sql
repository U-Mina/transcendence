CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    friend_list TEXT NULL,
    user_contact VARCHAR(50) NULL,
    intra_name VARCHAR(100) NULL,
    intra_url VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY users_user_email_unique (user_email)
);

INSERT INTO users (
    id,
    user_name,
    user_email,
    user_contact,
    intra_name,
    intra_url
)
VALUES
    ('1', 'hshah', 'ewu1@42hn.de', '123456', 'e1', '42hn1.com'),
    ('2', 'iiwkk', 'ewu2@42hn.de', NULL, 'e2', '42hn2.com'),
    ('3', 'uwiwo', 'ewu3@42hn.de', NULL, 'e3', '42hn3.com')
ON DUPLICATE KEY UPDATE
    user_name = VALUES(user_name),
    user_email = VALUES(user_email),
    user_contact = VALUES(user_contact),
    intra_name = VALUES(intra_name),
    intra_url = VALUES(intra_url);