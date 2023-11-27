/*
  Warnings:

  - You are about to alter the column `dailyPageViewsDelta` on the `DailyStats` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "DailyStats" ALTER COLUMN "dailyPageViewsDelta" SET DEFAULT 0,
ALTER COLUMN "dailyPageViewsDelta" SET DATA TYPE INTEGER;
