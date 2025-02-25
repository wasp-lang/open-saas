/*
  Warnings:

  - You are about to drop the column `sendEmail` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "sendEmail",
DROP COLUMN "subscriptionTier",
ADD COLUMN     "sendNewsletter" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionPlan" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeId_key" ON "User"("stripeId");
