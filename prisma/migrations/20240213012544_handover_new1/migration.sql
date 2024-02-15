/*
  Warnings:

  - You are about to drop the column `plant_uuid` on the `VehicleHandover` table. All the data in the column will be lost.
  - Added the required column `plant_uuid` to the `HandoverReceive` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "VehicleHandover" DROP CONSTRAINT "VehicleHandover_plant_uuid_fkey";

-- AlterTable
ALTER TABLE "HandoverReceive" ADD COLUMN     "plant_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VehicleHandover" DROP COLUMN "plant_uuid";

-- AddForeignKey
ALTER TABLE "HandoverReceive" ADD CONSTRAINT "HandoverReceive_plant_uuid_fkey" FOREIGN KEY ("plant_uuid") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE RESTRICT ON UPDATE CASCADE;
