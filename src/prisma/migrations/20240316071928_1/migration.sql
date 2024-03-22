/*
  Warnings:

  - Added the required column `tag` to the `permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `permission` ADD COLUMN `tag` VARCHAR(191) NOT NULL;
