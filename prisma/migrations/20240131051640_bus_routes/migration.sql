/*
  Warnings:

  - You are about to drop the column `bus_desciption` on the `Bus` table. All the data in the column will be lost.
  - You are about to drop the column `bus_stop` on the `Bus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bus" DROP COLUMN "bus_desciption",
DROP COLUMN "bus_stop",
ADD COLUMN     "busDescription" TEXT;

-- CreateTable
CREATE TABLE "BusRoutes" (
    "busRouteId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "busRouteName" TEXT NOT NULL,
    "busToOffice" TEXT,
    "busToHome" TEXT,

    CONSTRAINT "BusRoutes_pkey" PRIMARY KEY ("busRouteId")
);

-- AddForeignKey
ALTER TABLE "BusRoutes" ADD CONSTRAINT "BusRoutes_busId_fkey" FOREIGN KEY ("busId") REFERENCES "Bus"("busId") ON DELETE RESTRICT ON UPDATE CASCADE;
