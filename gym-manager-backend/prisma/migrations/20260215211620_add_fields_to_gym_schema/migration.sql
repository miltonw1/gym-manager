/*
  Warnings:

  - You are about to drop the column `address` on the `Gym` table. All the data in the column will be lost.
  - Added the required column `city` to the `Gym` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Gym` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Gym` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gym" DROP COLUMN "address",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Argentina',
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "street" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Gym_city_idx" ON "Gym"("city");

-- CreateIndex
CREATE INDEX "Gym_province_idx" ON "Gym"("province");
