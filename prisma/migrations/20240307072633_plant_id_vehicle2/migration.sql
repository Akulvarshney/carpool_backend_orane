/*
  Warnings:

  - You are about to alter the column `plant_uuid_id` on the `Vehicle` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_plant_uuid_id_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "plant_uuid_id" SET DATA TYPE VARCHAR(255);

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;
