/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `example` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `example_email_key` ON `example`(`email`);
