/*
  Warnings:

  - Made the column `address` on table `Gym` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `Gym` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Gym` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Gym" ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
