/*
  Warnings:

  - Made the column `password` on table `RealEstateAgency` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."RealEstateAgency" ALTER COLUMN "password" SET NOT NULL;
