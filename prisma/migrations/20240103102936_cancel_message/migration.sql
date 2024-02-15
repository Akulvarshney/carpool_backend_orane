-- AlterTable
ALTER TABLE "TripRequest" ADD COLUMN     "cancel_message" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Pending';
