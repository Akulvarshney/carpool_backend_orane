/*
  Warnings:

  - You are about to drop the column `assigned_driver_id` on the `Fuel` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fuel" DROP CONSTRAINT "Fuel_assigned_driver_id_fkey";

-- AlterTable
ALTER TABLE "Fuel" DROP COLUMN "assigned_driver_id",
ADD COLUMN     "driver_id" TEXT;

-- AddForeignKey
ALTER TABLE "Fuel" ADD CONSTRAINT "Fuel_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "Driver"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;
