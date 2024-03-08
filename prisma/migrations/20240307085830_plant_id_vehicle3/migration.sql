/*
  Warnings:

  - Made the column `plant_uuid_id` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_plant_uuid_id_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "plant_uuid_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;
