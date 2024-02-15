/*
  Warnings:

  - You are about to drop the column `cancel_message` on the `TripRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TripRequest" DROP COLUMN "cancel_message",
ADD COLUMN     "feedback_message" TEXT,
ADD COLUMN     "number_of_Days" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Maintenance" (
    "maintenanceId" TEXT NOT NULL,
    "sap_maintenance_id" TEXT,
    "vehicleId" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "maintenance_date" TIMESTAMP(3) NOT NULL,
    "maintenance_time" TIMESTAMP(3) NOT NULL,
    "maintenance_message" TEXT NOT NULL,
    "maintenance_status" TEXT NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("maintenanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_sap_maintenance_id_key" ON "Maintenance"("sap_maintenance_id");

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;
