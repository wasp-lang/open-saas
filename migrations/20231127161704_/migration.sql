/*
  Warnings:

  - You are about to drop the column `referrerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Referrer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_referrerId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referrerId";

-- DropTable
DROP TABLE "Referrer";
