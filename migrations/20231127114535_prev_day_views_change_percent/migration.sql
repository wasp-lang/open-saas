/*
  Warnings:

  - You are about to drop the column `dailyPageViewsDelta` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `totalPageViews` on the `DailyStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyStats" DROP COLUMN "dailyPageViewsDelta",
DROP COLUMN "totalPageViews",
ADD COLUMN     "prevDayViewsChangePercent" TEXT NOT NULL DEFAULT '0',
ADD COLUMN     "totalViews" INTEGER NOT NULL DEFAULT 0;
