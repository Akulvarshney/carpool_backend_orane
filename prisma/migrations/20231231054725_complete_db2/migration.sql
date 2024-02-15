-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_added_by_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_plant_uuid_id_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_shift_id_fkey";

-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "driver_employee_id" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "mobile_number" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "sex" DROP NOT NULL,
ALTER COLUMN "plant_uuid_id" DROP NOT NULL,
ALTER COLUMN "jobgrade" DROP NOT NULL,
ALTER COLUMN "experience" DROP NOT NULL,
ALTER COLUMN "rating" DROP NOT NULL,
ALTER COLUMN "dob" DROP NOT NULL,
ALTER COLUMN "profile_image" DROP NOT NULL,
ALTER COLUMN "added_by" DROP NOT NULL,
ALTER COLUMN "shift_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_plant_uuid_id_fkey" FOREIGN KEY ("plant_uuid_id") REFERENCES "PlantMaster"("plant_uuid_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Users"("authentication_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "ShiftsMaster"("Shift_ID") ON DELETE SET NULL ON UPDATE CASCADE;
