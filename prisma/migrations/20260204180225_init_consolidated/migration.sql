-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'REALESTATE', 'ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'LAND', 'COMMERCIAL_PROPERTY', 'OFFICE');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('RENT', 'SALE', 'SALE_RENT');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'RENTED', 'PAUSED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'ARS');

-- CreateTable
CREATE TABLE "AllUsers" (
    "user_id" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "AccountStatus" NOT NULL DEFAULT 'APPROVED',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllUsers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "RealEstate" (
    "user_id" INTEGER NOT NULL,
    "agencyName" TEXT NOT NULL,
    "phone" TEXT,
    "license" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "bio" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,

    CONSTRAINT "RealEstate_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Argentina',
    "type" "PropertyType" NOT NULL,
    "operationType" "OperationType" NOT NULL,
    "status" "PropertyStatus" NOT NULL,
    "salePrice" DOUBLE PRECISION,
    "saleCurrency" "Currency" DEFAULT 'USD',
    "rentPrice" DOUBLE PRECISION,
    "rentCurrency" "Currency" DEFAULT 'ARS',
    "area" DOUBLE PRECISION,
    "rooms" INTEGER,
    "bathrooms" INTEGER,
    "hasWater" BOOLEAN NOT NULL DEFAULT false,
    "hasElectricity" BOOLEAN NOT NULL DEFAULT false,
    "hasGas" BOOLEAN NOT NULL DEFAULT false,
    "hasInternet" BOOLEAN NOT NULL DEFAULT false,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "hasPool" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "parcelCCA" TEXT,
    "parcelPDA" TEXT,
    "parcelGeom" JSONB,
    "images" TEXT[],
    "realEstateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "operationType" "OperationType",
    "propertyType" "PropertyType",
    "city" TEXT,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllUsers_email_key" ON "AllUsers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RealEstate_license_key" ON "RealEstate"("license");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON "Favorite"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AllUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealEstate" ADD CONSTRAINT "RealEstate_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AllUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_realEstateId_fkey" FOREIGN KEY ("realEstateId") REFERENCES "RealEstate"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AllUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
