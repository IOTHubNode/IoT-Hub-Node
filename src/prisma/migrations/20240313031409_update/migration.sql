/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `role` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `role` ADD COLUMN `created_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_disabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `value` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NOT NULL DEFAULT '暂无描述';

-- CreateIndex
CREATE UNIQUE INDEX `role_value_key` ON `role`(`value`);
