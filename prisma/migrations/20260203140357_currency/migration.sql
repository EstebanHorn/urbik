/*
  Warnings:

  - You are about to drop the column `currency` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "currency",
ADD COLUMN     "rentCurrency" "Currency" DEFAULT 'ARS',
ADD COLUMN     "saleCurrency" "Currency" DEFAULT 'USD';
