/*
  Warnings:

  - You are about to drop the column `referrer` on the `Referrer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Referrer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Referrer_referrer_key";

-- AlterTable
ALTER TABLE "Referrer" DROP COLUMN "referrer",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'unknown';

-- CreateIndex
CREATE UNIQUE INDEX "Referrer_name_key" ON "Referrer"("name");
