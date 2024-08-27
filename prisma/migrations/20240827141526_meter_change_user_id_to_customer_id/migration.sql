/*
  Warnings:

  - You are about to drop the column `userId` on the `Meter` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `Meter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Meter` DROP FOREIGN KEY `Meter_userId_fkey`;

-- AlterTable
ALTER TABLE `Meter` DROP COLUMN `userId`,
    ADD COLUMN `customerId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Meter` ADD CONSTRAINT `Meter_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
