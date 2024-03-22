/*
  Warnings:

  - A unique constraint covering the columns `[account]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `account` ADD COLUMN `account` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `account_account_key` ON `account`(`account`);

-- CreateIndex
CREATE UNIQUE INDEX `account_email_key` ON `account`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `account_phone_key` ON `account`(`phone`);
