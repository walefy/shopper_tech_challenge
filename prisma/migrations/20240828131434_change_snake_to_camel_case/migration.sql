/*
  Warnings:

  - The primary key for the `Measure` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `has_confirmed` on the `Measure` table. All the data in the column will be lost.
  - You are about to drop the column `measure_datetime` on the `Measure` table. All the data in the column will be lost.
  - You are about to drop the column `measure_type` on the `Measure` table. All the data in the column will be lost.
  - You are about to drop the column `measure_uuid` on the `Measure` table. All the data in the column will be lost.
  - You are about to drop the column `measure_value` on the `Measure` table. All the data in the column will be lost.
  - Added the required column `measureDatetime` to the `Measure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `measureType` to the `Measure` table without a default value. This is not possible if the table is not empty.
  - The required column `measureUuid` was added to the `Measure` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `measureValue` to the `Measure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Measure` DROP PRIMARY KEY,
    DROP COLUMN `has_confirmed`,
    DROP COLUMN `measure_datetime`,
    DROP COLUMN `measure_type`,
    DROP COLUMN `measure_uuid`,
    DROP COLUMN `measure_value`,
    ADD COLUMN `hasConfirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `measureDatetime` DATETIME(3) NOT NULL,
    ADD COLUMN `measureType` ENUM('WATER', 'GAS') NOT NULL,
    ADD COLUMN `measureUuid` VARCHAR(191) NOT NULL,
    ADD COLUMN `measureValue` DOUBLE NOT NULL,
    ADD PRIMARY KEY (`measureUuid`);
