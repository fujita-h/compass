-- CreateTable
CREATE TABLE `attachment` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `fileName` VARCHAR(255) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` MEDIUMBLOB NULL,

    INDEX `attachment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `comment` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `documentId` VARCHAR(26) NOT NULL,
    `rawCommentId` VARCHAR(26) NOT NULL,
    `referenceCommentIdLazy` VARCHAR(26) NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `comment_documentId_idx`(`documentId`),
    INDEX `comment_rawCommentId_idx`(`rawCommentId`),
    INDEX `comment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `comment_raw` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `commentIdLazy` VARCHAR(26) NULL,
    `body` TEXT NOT NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `comment_raw_commentIdLazy_idx`(`commentIdLazy`),
    INDEX `comment_raw_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `configuration` (
    `ensureSingleRow` ENUM('single') NOT NULL DEFAULT 'single',
    `authEnableEmailVerificationForLocalUsers` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `authEnableSamlLogin` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `groupEnableCreateGroupForUsers` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `configuration_ensureSingleRow_key`(`ensureSingleRow`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `document` (
    `id` VARCHAR(26) NOT NULL,
    `paperId` VARCHAR(26) NOT NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `document_paperId_idx`(`paperId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `follow_group` (
    `userId` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,

    INDEX `follow_group_groupId_idx`(`groupId`),
    INDEX `follow_group_userId_idx`(`userId`),
    PRIMARY KEY (`userId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `follow_user` (
    `fromUserId` VARCHAR(26) NOT NULL,
    `toUserId` VARCHAR(26) NOT NULL,

    INDEX `follow_user_fromUserId_idx`(`fromUserId`),
    INDEX `follow_user_toUserId_idx`(`toUserId`),
    PRIMARY KEY (`fromUserId`, `toUserId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `follow_tag` (
    `userId` VARCHAR(26) NOT NULL,
    `tag` VARCHAR(63) NOT NULL,

    INDEX `follow_tag_userId_idx`(`userId`),
    PRIMARY KEY (`userId`, `tag`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `group` (
    `id` VARCHAR(26) NOT NULL,
    `name` VARCHAR(127) NOT NULL,
    `displayName` VARCHAR(127) NULL,
    `description` VARCHAR(500) NULL,
    `type` ENUM('public', 'normal', 'private') NOT NULL DEFAULT 'normal',

    UNIQUE INDEX `group_name_key`(`name`),
    INDEX `group_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `group_icon` (
    `id` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `group_icon_groupId_key`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `group_image` (
    `id` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `group_image_groupId_key`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `group_template` (
    `id` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `tags` TEXT NOT NULL,
    `body` LONGTEXT NOT NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `updatedAt` VARCHAR(50) NOT NULL,
    `updatedAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `group_template_groupId_idx`(`groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `like` (
    `userId` VARCHAR(26) NOT NULL,
    `documentId` VARCHAR(26) NOT NULL,

    INDEX `like_documentId_idx`(`documentId`),
    INDEX `like_userId_idx`(`userId`),
    PRIMARY KEY (`userId`, `documentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `notification` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `body` TEXT NOT NULL,
    `isRead` TINYINT NOT NULL DEFAULT 0,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `paper` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `documentIdLazy` VARCHAR(26) NULL,
    `parentPaperIdLazy` VARCHAR(26) NULL,
    `title` VARCHAR(255) NOT NULL,
    `tags` TEXT NOT NULL,
    `body` LONGTEXT NOT NULL,
    `isPosted` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `type` ENUM('normal', 'shared', 'question', 'discussion') NOT NULL DEFAULT 'normal',
    `status` ENUM('none', 'opened', 'closed') NOT NULL DEFAULT 'none',
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `updatedAt` VARCHAR(50) NOT NULL,
    `updatedAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `paper_createdAtNumber_idx`(`createdAtNumber`),
    INDEX `paper_documentIdLazy_idx`(`documentIdLazy`),
    INDEX `paper_groupId_idx`(`groupId`),
    INDEX `paper_isPosted_idx`(`isPosted`),
    INDEX `paper_parentPaperIdLazy_idx`(`parentPaperIdLazy`),
    INDEX `paper_updatedAtNumber_idx`(`updatedAtNumber`),
    INDEX `paper_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `saml_idp` (
    `id` VARCHAR(26) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `displayName` VARCHAR(255) NOT NULL,
    `entryPoint` VARCHAR(255) NOT NULL,
    `issuer` VARCHAR(255) NOT NULL,
    `cert` TEXT NOT NULL,
    `userMapping` ENUM('uuid', 'username', 'email') NOT NULL DEFAULT 'email',
    `attributeMappingForUuid` VARCHAR(255) NULL,
    `attributeMappingForUsername` VARCHAR(255) NULL,
    `attributeMappingForEmail` VARCHAR(255) NULL,

    UNIQUE INDEX `saml_idp_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `stock` (
    `userId` VARCHAR(26) NOT NULL,
    `documentId` VARCHAR(26) NOT NULL,
    `stockCategoryId` VARCHAR(26) NOT NULL,

    INDEX `stock_documentId_idx`(`documentId`),
    INDEX `stock_stockCategoryId_idx`(`stockCategoryId`),
    INDEX `stock_userId_idx`(`userId`),
    PRIMARY KEY (`documentId`, `userId`, `stockCategoryId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `stock_category` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `name` VARCHAR(127) NOT NULL,

    INDEX `stock_category_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(26) NOT NULL,
    `uuid` VARCHAR(50) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(255) NULL,
    `description` VARCHAR(500) NULL,
    `hash` VARCHAR(127) NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `user_uuid_key`(`uuid`),
    UNIQUE INDEX `user_username_key`(`username`),
    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user_group_map` (
    `userId` VARCHAR(26) NOT NULL,
    `groupId` VARCHAR(26) NOT NULL,
    `isAdmin` TINYINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `user_group_map_groupId_idx`(`groupId`),
    INDEX `user_group_map_userId_idx`(`userId`),
    PRIMARY KEY (`userId`, `groupId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user_icon` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `user_icon_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user_image` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `mimeType` VARCHAR(63) NOT NULL,
    `blob` BLOB NULL,

    UNIQUE INDEX `user_image_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `user_template` (
    `id` VARCHAR(26) NOT NULL,
    `userId` VARCHAR(26) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `tags` TEXT NOT NULL,
    `body` LONGTEXT NOT NULL,
    `createdAt` VARCHAR(50) NOT NULL,
    `createdAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `updatedAt` VARCHAR(50) NOT NULL,
    `updatedAtNumber` BIGINT UNSIGNED NOT NULL DEFAULT 0,

    INDEX `user_template_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- CreateTable
CREATE TABLE `read` (
    `userId` VARCHAR(26) NOT NULL,
    `documentId` VARCHAR(26) NOT NULL,
    `paperId` VARCHAR(26) NOT NULL,

    INDEX `read_documentId_idx`(`documentId`),
    INDEX `read_paperId_idx`(`paperId`),
    PRIMARY KEY (`userId`, `documentId`, `paperId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- AddForeignKey
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_rawCommentId_fkey` FOREIGN KEY (`rawCommentId`) REFERENCES `comment_raw`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_raw` ADD CONSTRAINT `comment_raw_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document` ADD CONSTRAINT `document_paperId_fkey` FOREIGN KEY (`paperId`) REFERENCES `paper`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_group` ADD CONSTRAINT `follow_group_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_group` ADD CONSTRAINT `follow_group_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_user` ADD CONSTRAINT `follow_user_fromUserId_fkey` FOREIGN KEY (`fromUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_user` ADD CONSTRAINT `follow_user_toUserId_fkey` FOREIGN KEY (`toUserId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow_tag` ADD CONSTRAINT `follow_tag_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `group_icon` ADD CONSTRAINT `group_icon_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_image` ADD CONSTRAINT `group_image_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_template` ADD CONSTRAINT `group_template_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like` ADD CONSTRAINT `like_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `like` ADD CONSTRAINT `like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_stockCategoryId_fkey` FOREIGN KEY (`stockCategoryId`) REFERENCES `stock_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_category` ADD CONSTRAINT `stock_category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_group_map` ADD CONSTRAINT `user_group_map_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_group_map` ADD CONSTRAINT `user_group_map_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_icon` ADD CONSTRAINT `user_icon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_image` ADD CONSTRAINT `user_image_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_template` ADD CONSTRAINT `user_template_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `read` ADD CONSTRAINT `read_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `read` ADD CONSTRAINT `read_paperId_fkey` FOREIGN KEY (`paperId`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `read` ADD CONSTRAINT `read_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
