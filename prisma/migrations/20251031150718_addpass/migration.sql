/*
  Warnings:

  - Made the column `email` on table `RealEstateAgency` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAgency" ALTER COLUMN "email" SET NOT NULL;
