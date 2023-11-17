/*
  Warnings:

  - A unique constraint covering the columns `[referrer]` on the table `Referrer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Referrer_referrer_key" ON "Referrer"("referrer");
