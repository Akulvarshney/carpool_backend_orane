/*
  Warnings:

  - A unique constraint covering the columns `[sap_driver_id]` on the table `Driver` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_handoverRecieve_id]` on the table `HandoverReceive` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_maintenance_id]` on the table `Maintenance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_plant_id]` on the table `PlantMaster` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_shift_id]` on the table `ShiftsMaster` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_trip_id]` on the table `TripRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_user_id]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_vehicle_id]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sap_vehicleOwner_id]` on the table `VehicleOwner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "sap_driver_id" TEXT;

-- AlterTable
ALTER TABLE "HandoverReceive" ADD COLUMN     "sap_handoverRecieve_id" TEXT;

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "sap_maintenance_id" TEXT;

-- AlterTable
ALTER TABLE "PlantMaster" ADD COLUMN     "sap_plant_id" TEXT;

-- AlterTable
ALTER TABLE "ShiftsMaster" ADD COLUMN     "sap_shift_id" TEXT;

-- AlterTable
ALTER TABLE "TripRequest" ADD COLUMN     "sap_trip_id" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "sap_user_id" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "sap_vehicle_id" TEXT;

-- AlterTable
ALTER TABLE "VehicleOwner" ADD COLUMN     "sap_vehicleOwner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Driver_sap_driver_id_key" ON "Driver"("sap_driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "HandoverReceive_sap_handoverRecieve_id_key" ON "HandoverReceive"("sap_handoverRecieve_id");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_sap_maintenance_id_key" ON "Maintenance"("sap_maintenance_id");

-- CreateIndex
CREATE UNIQUE INDEX "PlantMaster_sap_plant_id_key" ON "PlantMaster"("sap_plant_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftsMaster_sap_shift_id_key" ON "ShiftsMaster"("sap_shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "TripRequest_sap_trip_id_key" ON "TripRequest"("sap_trip_id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_sap_user_id_key" ON "Users"("sap_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_sap_vehicle_id_key" ON "Vehicle"("sap_vehicle_id");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleOwner_sap_vehicleOwner_id_key" ON "VehicleOwner"("sap_vehicleOwner_id");
