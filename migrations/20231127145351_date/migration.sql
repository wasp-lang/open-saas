/*
  Warnings:

  - You are about to drop the column `dateUTC` on the `PageViewSource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PageViewSource" DROP COLUMN "dateUTC",
ADD COLUMN     "dat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
