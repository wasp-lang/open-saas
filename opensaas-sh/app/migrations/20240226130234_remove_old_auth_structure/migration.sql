/*
  Warnings:

  - You are about to drop the column `emailVerificationSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetSentAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `SocialLogin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SocialLogin" DROP CONSTRAINT "SocialLogin_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationSentAt",
DROP COLUMN "isEmailVerified",
DROP COLUMN "password",
DROP COLUMN "passwordResetSentAt";

-- DropTable
DROP TABLE "SocialLogin";
