/*
  Warnings:

  - You are about to alter the column `number_of_Days` on the `TripRequest` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "TripRequest" ALTER COLUMN "number_of_Days" SET DATA TYPE INTEGER;
