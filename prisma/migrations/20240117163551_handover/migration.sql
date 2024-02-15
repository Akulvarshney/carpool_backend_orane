/*
  Warnings:

  - You are about to drop the column `comments` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the `Maintenance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Maintenance" DROP CONSTRAINT "Maintenance_vehicleId_fkey";

-- AlterTable
ALTER TABLE "HandoverReceive" DROP COLUMN "comments",
ADD COLUMN     "fuelReading" TEXT,
ADD COLUMN     "message" TEXT,
ADD COLUMN     "odometerReading" TEXT,
ADD COLUMN     "plant_uuid_id" TEXT;

-- DropTable
DROP TABLE "Maintenance";

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;
