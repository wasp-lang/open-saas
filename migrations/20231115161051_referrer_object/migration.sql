/*
  Warnings:

  - You are about to drop the column `referrer` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "referrer";

-- CreateTable
CREATE TABLE "Referrer" (
    "id" SERIAL NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT 'unknown',
    "count" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Referrer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referrer_userId_key" ON "Referrer"("userId");

-- AddForeignKey
ALTER TABLE "Referrer" ADD CONSTRAINT "Referrer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
