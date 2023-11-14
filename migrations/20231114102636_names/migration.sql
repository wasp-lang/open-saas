/*
  Warnings:

  - You are about to drop the column `newPaidUsers` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `newPaidUsersDelta` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `newUsers` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `newUsersDelta` on the `DailyStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DailyStats" DROP COLUMN "newPaidUsers",
DROP COLUMN "newPaidUsersDelta",
DROP COLUMN "newUsers",
DROP COLUMN "newUsersDelta",
ADD COLUMN     "paidUserCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paidUserDelta" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userDelta" INTEGER NOT NULL DEFAULT 0;
