/*
  Warnings:

  - You are about to drop the column `role` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF',
ALTER COLUMN "gymId" DROP NOT NULL;
