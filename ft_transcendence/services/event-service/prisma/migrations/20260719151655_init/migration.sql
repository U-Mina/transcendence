-- CreateTable
CREATE TABLE `events` (
    `event_id` VARCHAR(36) NOT NULL,
    `event_name` VARCHAR(255) NOT NULL,
    `creator_id` VARCHAR(36) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `category` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `comment` TEXT NULL,
    `min_participant` INTEGER NULL,
    `safety_check` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_creator_id_idx`(`creator_id`),
    PRIMARY KEY (`event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
