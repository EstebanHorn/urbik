-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "parcelCCA" TEXT,
ADD COLUMN     "parcelGeom" JSONB,
ADD COLUMN     "parcelPDA" TEXT;
