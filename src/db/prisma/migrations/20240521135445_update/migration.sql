-- AlterTable
ALTER TABLE `device` MODIFY `status` INTEGER NOT NULL DEFAULT 2;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `device_device_model_id_fkey` FOREIGN KEY (`device_model_id`) REFERENCES `device_model`(`device_model_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
