/*
  Warnings:

  - You are about to drop the `group_image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_image` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `group_image` DROP FOREIGN KEY `group_image_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `user_image` DROP FOREIGN KEY `user_image_userId_fkey`;

-- DropTable
DROP TABLE `group_image`;

-- DropTable
DROP TABLE `user_image`;

-- CreateTable
CREATE TABLE `group_cover` (
    `id` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `group_cover_groupId_key`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user_cover` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `user_cover_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- AddForeignKey
ALTER TABLE `group_cover` ADD CONSTRAINT `group_cover_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_cover` ADD CONSTRAINT `user_cover_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
