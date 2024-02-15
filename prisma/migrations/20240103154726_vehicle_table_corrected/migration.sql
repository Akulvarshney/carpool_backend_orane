/*
  Warnings:

  - A unique constraint covering the columns `[vehicle_plate]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vehicle_vehicle_id_key";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "vehicle_plate" SET DATA TYPE TEXT,
ALTER COLUMN "vehicle_description" DROP NOT NULL,
ALTER COLUMN "vehicle_status" SET DEFAULT 'Available',
ALTER COLUMN "vehicle_status" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicle_plate_key" ON "Vehicle"("vehicle_plate");
