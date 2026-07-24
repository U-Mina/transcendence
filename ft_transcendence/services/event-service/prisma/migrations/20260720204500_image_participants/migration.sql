-- AlterTable
ALTER TABLE `events` ADD COLUMN `image_url` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `event_participants` (
    `event_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `event_participants_user_id_idx`(`user_id`),
    PRIMARY KEY (`event_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event_participants`
    ADD CONSTRAINT `event_participants_event_id_fkey`
    FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
