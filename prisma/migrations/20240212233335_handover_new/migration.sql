/*
  Warnings:

  - The primary key for the `HandoverReceive` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date_time` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the column `plant_uuid_id` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the column `sap_handoverRecieve_id` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `HandoverReceive` table. All the data in the column will be lost.
  - You are about to drop the column `vehicle_id` on the `HandoverReceive` table. All the data in the column will be lost.
  - Added the required column `handover_id` to the `HandoverReceive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `handover_type` to the `HandoverReceive` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_handover_id` to the `HandoverReceive` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "HandoverReceive" DROP CONSTRAINT "HandoverReceive_plant_uuid_id_fkey";

-- DropForeignKey
ALTER TABLE "HandoverReceive" DROP CONSTRAINT "HandoverReceive_vehicle_id_fkey";

-- DropIndex
DROP INDEX "HandoverReceive_sap_handoverRecieve_id_key";

-- AlterTable
ALTER TABLE "HandoverReceive" DROP CONSTRAINT "HandoverReceive_pkey",
DROP COLUMN "date_time",
DROP COLUMN "id",
DROP COLUMN "plant_uuid_id",
DROP COLUMN "sap_handoverRecieve_id",
DROP COLUMN "status",
DROP COLUMN "vehicle_id",
ADD COLUMN     "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "handover_id" TEXT NOT NULL,
ADD COLUMN     "handover_type" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vehicleVehicle_id" TEXT,
ADD COLUMN     "vehicle_handover_id" TEXT NOT NULL,
ADD CONSTRAINT "HandoverReceive_pkey" PRIMARY KEY ("handover_id");

-- CreateTable
CREATE TABLE "VehicleHandover" (
    "handover_id" TEXT NOT NULL,
    "sap_handoverRecieve_id" TEXT,
    "from_driver_id" TEXT NOT NULL,
    "to_driver_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "plant_uuid" TEXT NOT NULL,
    "handover_status" TEXT NOT NULL,
    "Handover" BOOLEAN NOT NULL DEFAULT false,
    "Receive" BOOLEAN NOT NULL DEFAULT false,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleHandover_pkey" PRIMARY KEY ("handover_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleHandover_sap_handoverRecieve_id_key" ON "VehicleHandover"("sap_handoverRecieve_id");

-- AddForeignKey
ALTER TABLE "VehicleHandover" ADD CONSTRAINT "VehicleHandover_from_driver_id_fkey" FOREIGN KEY ("from_driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHandover" ADD CONSTRAINT "VehicleHandover_to_driver_id_fkey" FOREIGN KEY ("to_driver_id") REFERENCES "Driver"("driver_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHandover" ADD CONSTRAINT "VehicleHandover_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHandover" ADD CONSTRAINT "VehicleHandover_plant_uuid_fkey" FOREIGN KEY ("plant_uuid") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_vehicle_handover_id_fkey" FOREIGN KEY ("vehicle_handover_id") REFERENCES "VehicleHandover"("handover_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_vehicleVehicle_id_fkey" FOREIGN KEY ("vehicleVehicle_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE SET NULL ON UPDATE CASCADE;
