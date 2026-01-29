-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'ARS');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'USD';
