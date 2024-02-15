-- AlterTable
ALTER TABLE "Fuel" ADD COLUMN     "assigned_driver_id" TEXT;

-- AddForeignKey
ALTER TABLE "Fuel" ADD CONSTRAINT "Fuel_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "Driver"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;
