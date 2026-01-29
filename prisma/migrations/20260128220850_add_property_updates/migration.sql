/*
  Warnings:

  - You are about to drop the column `isAvailable` on the `Property` table. All the data in the column will be lost.
  - Made the column `description` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_realEstateId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "isAvailable",
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'Argentina',
ALTER COLUMN "operationType" DROP DEFAULT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "currency" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
