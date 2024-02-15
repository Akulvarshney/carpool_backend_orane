/*
  Warnings:

  - You are about to drop the column `driver_employee_id` on the `Driver` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Driver_driver_employee_id_key";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "driver_employee_id";
