/*
  Warnings:

  - You are about to drop the column `team_id` on the `account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `team_id`,
    ADD COLUMN `organization_id` BIGINT NOT NULL DEFAULT 0;
