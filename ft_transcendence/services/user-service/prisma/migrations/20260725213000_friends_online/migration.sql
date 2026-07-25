-- AlterTable
ALTER TABLE `users` ADD COLUMN `last_seen_at` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `friendships` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `friend_id` VARCHAR(36) NOT NULL,
    `status` ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `friendships_friend_id_status_idx` ON `friendships`(`friend_id`, `status`);

-- CreateIndex
CREATE INDEX `friendships_user_id_status_idx` ON `friendships`(`user_id`, `status`);

-- CreateIndex
CREATE UNIQUE INDEX `friendships_user_id_friend_id_key` ON `friendships`(`user_id`, `friend_id`);

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `friendships` ADD CONSTRAINT `friendships_friend_id_fkey` FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
