/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `account` DROP PRIMARY KEY,
    MODIFY `account_id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`account_id`);
