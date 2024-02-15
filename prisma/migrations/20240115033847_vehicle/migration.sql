-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_vehicle_owner_id_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "vehicle_owner_id" DROP NOT NULL,
ALTER COLUMN "vehicle_status" DROP NOT NULL;

-- AlterTable
ALTER TABLE "VehicleOwner" ALTER COLUMN "sex" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "email_id" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_vehicle_owner_id_fkey" FOREIGN KEY ("vehicle_owner_id") REFERENCES "VehicleOwner"("vehicle_owner_id") ON DELETE SET NULL ON UPDATE CASCADE;
