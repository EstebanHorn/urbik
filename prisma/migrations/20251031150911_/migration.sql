/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `RealEstateAgency` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RealEstateAgency_email_key" ON "public"."RealEstateAgency"("email");
