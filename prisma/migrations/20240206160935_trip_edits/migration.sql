-- AlterTable
ALTER TABLE "TripRequest" ADD COLUMN     "fuelEnding" DOUBLE PRECISION,
ADD COLUMN     "fuelStarting" DOUBLE PRECISION,
ADD COLUMN     "totalDistanceCovered" DOUBLE PRECISION,
ADD COLUMN     "totalFuelConsumed" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Fuel" (
    "id" TEXT NOT NULL,
    "currentReading" DOUBLE PRECISION,
    "invoiceAmount" DOUBLE PRECISION,
    "fuelStationLocation" TEXT,
    "trip_id" TEXT,

    CONSTRAINT "Fuel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fuel" ADD CONSTRAINT "Fuel_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "TripRequest"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;
