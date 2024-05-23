-- AddForeignKey
ALTER TABLE `account` ADD CONSTRAINT `account_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`organization_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `device` ADD CONSTRAINT `device_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `account`(`account_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
