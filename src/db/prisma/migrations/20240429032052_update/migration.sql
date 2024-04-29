-- CreateTable
CREATE TABLE `Device` (
    `device_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL DEFAULT '暂无描述',
    `device_model_id` BIGINT NOT NULL DEFAULT 0,
    `device_group_id` BIGINT NOT NULL DEFAULT 0,
    `organization_id` BIGINT NOT NULL DEFAULT 0,
    `account_id` VARCHAR(191) NOT NULL DEFAULT '',
    `status` INTEGER NOT NULL DEFAULT 1,
    `token` VARCHAR(191) NOT NULL DEFAULT '',
    `is_disabled` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_time` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `updated_by` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`device_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
