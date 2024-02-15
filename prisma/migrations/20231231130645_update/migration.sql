-- DropForeignKey
ALTER TABLE "TripRequest" DROP CONSTRAINT "TripRequest_assigned_car_id_fkey";

-- DropForeignKey
ALTER TABLE "TripRequest" DROP CONSTRAINT "TripRequest_assigned_driver_id_fkey";

-- DropForeignKey
ALTER TABLE "TripRequest" DROP CONSTRAINT "TripRequest_plant_uuid_id_fkey";

-- DropForeignKey
ALTER TABLE "TripRequest" DROP CONSTRAINT "TripRequest_user_id_fkey";

-- AlterTable
ALTER TABLE "TripRequest" ALTER COLUMN "plant_uuid_id" DROP NOT NULL,
ALTER COLUMN "user_id" DROP NOT NULL,
ALTER COLUMN "vehicle_type" DROP NOT NULL,
ALTER COLUMN "purpose" DROP NOT NULL,
ALTER COLUMN "department" DROP NOT NULL,
ALTER COLUMN "priority" DROP NOT NULL,
ALTER COLUMN "passengers_number" DROP NOT NULL,
ALTER COLUMN "start_time" DROP NOT NULL,
ALTER COLUMN "end_time" DROP NOT NULL,
ALTER COLUMN "from_destination" DROP NOT NULL,
ALTER COLUMN "to_destination" DROP NOT NULL,
ALTER COLUMN "pickup_point" DROP NOT NULL,
ALTER COLUMN "trip_type" DROP NOT NULL,
ALTER COLUMN "comments" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "approved_by_manager" DROP NOT NULL,
ALTER COLUMN "assigned_car_id" DROP NOT NULL,
ALTER COLUMN "assigned_driver_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_car_id_fkey" FOREIGN KEY ("assigned_car_id") REFERENCES "Vehicle"("vehicle_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "Driver"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;
