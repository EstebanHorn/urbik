/*
  Warnings:

  - You are about to drop the column `price` on the `Property` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "AllUsers" ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "price",
ADD COLUMN     "rentPrice" DOUBLE PRECISION,
ADD COLUMN     "salePrice" DOUBLE PRECISION;
