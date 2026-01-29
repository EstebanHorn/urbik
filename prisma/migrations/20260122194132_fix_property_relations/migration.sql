/*
  Warnings:

  - You are about to drop the column `userId` on the `Property` table. All the data in the column will be lost.
  - Made the column `realEstateId` on table `Property` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_realEstateId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_userId_fkey";

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "userId",
ALTER COLUMN "realEstateId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
