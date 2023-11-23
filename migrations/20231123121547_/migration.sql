/*
  Warnings:

  - You are about to drop the column `subscriptionType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscriptionType",
ADD COLUMN     "subscriptionTier" TEXT;
