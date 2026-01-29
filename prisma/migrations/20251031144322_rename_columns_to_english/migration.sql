/*
  Warnings:

  - The values [AGENTE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Alerta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Consulta` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favorito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inmobiliaria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Propiedad` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL_PROPERTY', 'OFFICE');

-- CreateEnum
CREATE TYPE "public"."OperationType" AS ENUM ('RENT', 'SALE');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('USER', 'ADMIN', 'AGENT');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Alerta" DROP CONSTRAINT "Alerta_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_propiedadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorito" DROP CONSTRAINT "Favorito_propiedadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favorito" DROP CONSTRAINT "Favorito_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Inmobiliaria" DROP CONSTRAINT "Inmobiliaria_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Propiedad" DROP CONSTRAINT "Propiedad_inmobiliariaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Propiedad" DROP CONSTRAINT "Propiedad_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "first_name",
DROP COLUMN "last_name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- DropTable
DROP TABLE "public"."Alerta";

-- DropTable
DROP TABLE "public"."Consulta";

-- DropTable
DROP TABLE "public"."Favorito";

-- DropTable
DROP TABLE "public"."Inmobiliaria";

-- DropTable
DROP TABLE "public"."Propiedad";

-- DropEnum
DROP TYPE "public"."TipoOperacion";

-- DropEnum
DROP TYPE "public"."TipoPropiedad";

-- CreateTable
CREATE TABLE "public"."RealEstateAgency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateAgency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "type" "public"."PropertyType" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,
    "realEstateAgencyId" INTEGER,
    "images" TEXT[],
    "operationType" "public"."OperationType" NOT NULL DEFAULT 'RENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Inquiry" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "operationType" "public"."OperationType",
    "propertyType" "public"."PropertyType",
    "city" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON "public"."Favorite"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "public"."RealEstateAgency" ADD CONSTRAINT "RealEstateAgency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_realEstateAgencyId_fkey" FOREIGN KEY ("realEstateAgencyId") REFERENCES "public"."RealEstateAgency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
