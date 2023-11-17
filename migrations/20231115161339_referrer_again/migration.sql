/*
  Warnings:

  - You are about to drop the column `userId` on the `Referrer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Referrer" DROP CONSTRAINT "Referrer_userId_fkey";

-- DropIndex
DROP INDEX "Referrer_userId_key";

-- AlterTable
ALTER TABLE "Referrer" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referrerId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Referrer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
