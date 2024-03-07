-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "plant_uuid_id" TEXT;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;
