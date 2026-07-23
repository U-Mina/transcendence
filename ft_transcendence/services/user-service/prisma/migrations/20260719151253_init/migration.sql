-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `user_email` VARCHAR(255) NOT NULL,
    `friend_list` TEXT NULL,
    `user_contact` VARCHAR(50) NULL,
    `intra_name` VARCHAR(100) NULL,
    `intra_url` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_user_email_key`(`user_email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
