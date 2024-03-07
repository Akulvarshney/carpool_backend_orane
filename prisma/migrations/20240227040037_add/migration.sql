-- AlterTable
ALTER TABLE "TripRequest" ADD COLUMN     "userManager_id" TEXT,
ALTER COLUMN "request_number" DROP NOT NULL,
ALTER COLUMN "request_number" DROP DEFAULT,
ALTER COLUMN "request_number" SET DATA TYPE TEXT;
DROP SEQUENCE "TripRequest_request_number_seq";
