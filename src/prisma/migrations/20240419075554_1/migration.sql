/*
  Warnings:

  - You are about to drop the column `data` on the `device_model` table. All the data in the column will be lost.
  - Added the required column `content` to the `device_model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `device_model` DROP COLUMN `data`,
    ADD COLUMN `communication_type` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `content` JSON NOT NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL DEFAULT 'https://image-1308319148.cos.ap-chengdu.myqcloud.com/main/%E4%B8%AA%E4%BA%BA%E5%A4%B4%E5%83%8F.png',
    ADD COLUMN `protocol_type` INTEGER NOT NULL DEFAULT 1;
