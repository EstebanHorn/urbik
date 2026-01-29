/*
  Warnings:

  - The values [REALSTATE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'REALESTATE', 'ADMIN', 'AGENT');
ALTER TABLE "public"."AllUsers" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "AllUsers" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "AllUsers" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;
