-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "plant_uuid_id" TEXT;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;
