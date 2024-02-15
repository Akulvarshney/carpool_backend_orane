-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_added_by_fkey";

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
