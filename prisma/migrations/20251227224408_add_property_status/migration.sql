-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'PAUSED');

-- AlterEnum
ALTER TYPE "OperationType" ADD VALUE 'SALE_RENT';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';
