/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `RealEstate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `senderEmail` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Inquiry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPhone` to the `Inquiry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_userId_fkey";

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "senderEmail" TEXT NOT NULL,
ADD COLUMN     "senderName" TEXT NOT NULL,
ADD COLUMN     "senderPhone" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD',
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RealEstate" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RealEstate_slug_key" ON "RealEstate"("slug");

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
