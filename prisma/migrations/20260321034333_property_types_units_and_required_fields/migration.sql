-- AlterEnum
ALTER TYPE "OperationType" ADD VALUE 'TEMP_RENT';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "PropertyStatus" ADD VALUE 'SUSPENDED';
ALTER TYPE "PropertyStatus" ADD VALUE 'HISTORIC';
ALTER TYPE "PropertyStatus" ADD VALUE 'APPRAISAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'FIELD';
ALTER TYPE "PropertyType" ADD VALUE 'BUSINESS_BACKGROUND';
ALTER TYPE "PropertyType" ADD VALUE 'GARAGE';
ALTER TYPE "PropertyType" ADD VALUE 'WAREHOUSE';
ALTER TYPE "PropertyType" ADD VALUE 'DEVELOPMENT';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "backLength" DOUBLE PRECISION,
ADD COLUMN     "coveredArea" DOUBLE PRECISION,
ADD COLUMN     "district" TEXT,
ADD COLUMN     "expenses" DOUBLE PRECISION,
ADD COLUMN     "extraData" JSONB,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "frontLength" DOUBLE PRECISION,
ADD COLUMN     "garages" INTEGER,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "plants" INTEGER,
ADD COLUMN     "semiCoveredArea" DOUBLE PRECISION,
ADD COLUMN     "streetName" TEXT,
ADD COLUMN     "streetNumber" TEXT,
ADD COLUMN     "toilets" INTEGER,
ADD COLUMN     "uncoveredArea" DOUBLE PRECISION,
ADD COLUMN     "unitNumber" TEXT,
ADD COLUMN     "unitType" TEXT;
