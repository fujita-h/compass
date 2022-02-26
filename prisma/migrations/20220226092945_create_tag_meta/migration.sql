-- CreateTable
CREATE TABLE `tag_meta` (
    `tag` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1023) NULL,
    `iconMimeType` VARCHAR(63) NOT NULL,
    `iconBlob` BLOB NULL,
    `coverMimeType` VARCHAR(63) NOT NULL,
    `coverBlob` BLOB NULL,
    `updatedByUserId` VARCHAR(26) NOT NULL,
    `updatedAt` VARCHAR(50) NOT NULL,
    `updatedAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `tag_meta_updatedByUserId_idx`(`updatedByUserId`),
    PRIMARY KEY (`tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- AddForeignKey
ALTER TABLE `tag_meta` ADD CONSTRAINT `tag_meta_updatedByUserId_fkey` FOREIGN KEY (`updatedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
