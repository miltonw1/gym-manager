-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF';
