/*
  Warnings:

  - Added the required column `created_by` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` ADD COLUMN `created_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_disabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `role_id` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL;
