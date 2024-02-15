/*
  Warnings:

  - You are about to drop the column `employee_Id` on the `Users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Users_employee_Id_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "employee_Id";
