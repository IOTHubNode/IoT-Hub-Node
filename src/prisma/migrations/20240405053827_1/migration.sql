/*
  Warnings:

  - You are about to drop the column `content` on the `devicemodel` table. All the data in the column will be lost.
  - Added the required column `data` to the `DeviceModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `devicemodel` DROP COLUMN `content`,
    ADD COLUMN `data` JSON NOT NULL;
