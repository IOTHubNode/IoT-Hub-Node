/*
  Warnings:

  - You are about to drop the `team` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `created_by` to the `organization` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `organization` ADD COLUMN `created_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_disabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `parent_id` BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL DEFAULT '暂无描述';

-- DropTable
DROP TABLE `team`;
