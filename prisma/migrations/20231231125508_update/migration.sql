/*
  Warnings:

  - You are about to drop the column `added_by` on the `Driver` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_added_by_fkey";

-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "added_by";
