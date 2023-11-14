/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `DailyStats` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_key" ON "DailyStats"("date");
