-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "softDelet" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "softDelet" BOOLEAN NOT NULL DEFAULT false;
