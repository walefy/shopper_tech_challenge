/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `customerCode` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Measure` DROP FOREIGN KEY `Measure_customerCode_fkey`;

-- AlterTable
ALTER TABLE `Customer` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `customerCode` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`customerCode`);

-- AddForeignKey
ALTER TABLE `Measure` ADD CONSTRAINT `Measure_customerCode_fkey` FOREIGN KEY (`customerCode`) REFERENCES `Customer`(`customerCode`) ON DELETE RESTRICT ON UPDATE CASCADE;
