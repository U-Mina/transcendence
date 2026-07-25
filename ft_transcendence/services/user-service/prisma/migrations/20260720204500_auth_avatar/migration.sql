-- AlterTable
ALTER TABLE `users`
    ADD COLUMN `password_hash` VARCHAR(255) NULL,
    ADD COLUMN `avatar_url` VARCHAR(255) NULL;
