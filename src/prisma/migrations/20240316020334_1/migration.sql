/*
  Warnings:

  - You are about to drop the column `role_id` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rule_value]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `created_by` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rule_value` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` DROP COLUMN `role_id`;

-- AlterTable
ALTER TABLE `permission` ADD COLUMN `created_by` VARCHAR(191) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT '暂无描述',
    ADD COLUMN `is_disabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `rule_value` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` INTEGER NOT NULL,
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `permission_rule_value_key` ON `permission`(`rule_value`);
