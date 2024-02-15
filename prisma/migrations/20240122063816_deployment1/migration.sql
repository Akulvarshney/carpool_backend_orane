-- CreateTable
CREATE TABLE "Bus" (
    "busId" TEXT NOT NULL,
    "sapBusId" TEXT,
    "busRegistrationNumber" TEXT,
    "vehicle_owner_id" TEXT,
    "bus_route_name" TEXT,
    "bus_stop" JSONB,

    CONSTRAINT "Bus_pkey" PRIMARY KEY ("busId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bus_sapBusId_key" ON "Bus"("sapBusId");

-- CreateIndex
CREATE UNIQUE INDEX "Bus_busRegistrationNumber_key" ON "Bus"("busRegistrationNumber");

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_vehicle_owner_id_fkey" FOREIGN KEY ("vehicle_owner_id") REFERENCES "VehicleOwner"("vehicle_owner_id") ON DELETE SET NULL ON UPDATE CASCADE;
