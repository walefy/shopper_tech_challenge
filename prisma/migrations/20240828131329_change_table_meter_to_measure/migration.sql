/*
  Warnings:

  - You are about to drop the `Meter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Meter` DROP FOREIGN KEY `Meter_customerId_fkey`;

-- DropTable
DROP TABLE `Meter`;

-- CreateTable
CREATE TABLE `Measure` (
    `measure_uuid` VARCHAR(191) NOT NULL,
    `customerCode` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `measure_value` DOUBLE NOT NULL,
    `has_confirmed` BOOLEAN NOT NULL DEFAULT false,
    `measure_type` ENUM('WATER', 'GAS') NOT NULL,
    `measure_datetime` DATETIME(3) NOT NULL,

    PRIMARY KEY (`measure_uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Measure` ADD CONSTRAINT `Measure_customerCode_fkey` FOREIGN KEY (`customerCode`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
