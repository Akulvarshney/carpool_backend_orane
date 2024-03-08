-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_plant_uuid_id_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "plant_uuid_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;
