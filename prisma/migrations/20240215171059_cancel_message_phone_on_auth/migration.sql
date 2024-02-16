/*
  Warnings:

  - A unique constraint covering the columns `[phone_number]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Auth_phone_number_key" ON "Auth"("phone_number");
