/*
  Warnings:

  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `ActionHistory` DROP FOREIGN KEY `ActionHistory_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `ActionHistory` DROP FOREIGN KEY `ActionHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `History` DROP FOREIGN KEY `History_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `History` DROP FOREIGN KEY `History_userId_fkey`;

-- DropIndex
DROP INDEX `ActionHistory_createdAt_idx` ON `ActionHistory`;

-- DropIndex
DROP INDEX `ActionHistory_taskId_idx` ON `ActionHistory`;

-- DropIndex
DROP INDEX `ActionHistory_userId_idx` ON `ActionHistory`;

-- DropTable
DROP TABLE `History`;

-- AddForeignKey
ALTER TABLE `ActionHistory` ADD CONSTRAINT `ActionHistory_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActionHistory` ADD CONSTRAINT `ActionHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
