-- CreateEnum
CREATE TYPE "public"."USER_ROLE" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."USER_ROLE" NOT NULL DEFAULT 'USER';
