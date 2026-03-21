-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'PH';
ALTER TYPE "PropertyType" ADD VALUE 'COUNTRY';

-- DropIndex
DROP INDEX "RealEstate_license_key";

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "featureGroups" JSONB,
ADD COLUMN     "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGarden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasGrill" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLaundry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPriceHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "propertySubtype" TEXT,
ADD COLUMN     "tour360Url" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;

-- AlterTable
ALTER TABLE "RealEstate" ALTER COLUMN "license" SET DEFAULT '';

-- CreateTable
CREATE TABLE "RealEstateLicense" (
    "id" SERIAL NOT NULL,
    "realEstateId" INTEGER NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "responsibleName" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealEstateOffice" (
    "id" SERIAL NOT NULL,
    "realEstateId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateOffice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RealEstateLicense_realEstateId_idx" ON "RealEstateLicense"("realEstateId");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstateLicense_licenseNumber_province_jurisdiction_key" ON "RealEstateLicense"("licenseNumber", "province", "jurisdiction");

-- CreateIndex
CREATE INDEX "RealEstateOffice_realEstateId_idx" ON "RealEstateOffice"("realEstateId");

-- AddForeignKey
ALTER TABLE "RealEstateLicense" ADD CONSTRAINT "RealEstateLicense_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstateOffice" ADD CONSTRAINT "RealEstateOffice_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
