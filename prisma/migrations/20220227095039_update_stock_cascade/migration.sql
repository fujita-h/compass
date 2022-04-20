-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `stock_stockCategoryId_fkey`;

-- AddForeignKey
ALTER TABLE `stock` ADD CONSTRAINT `stock_stockCategoryId_fkey` FOREIGN KEY (`stockCategoryId`) REFERENCES `stock_category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
