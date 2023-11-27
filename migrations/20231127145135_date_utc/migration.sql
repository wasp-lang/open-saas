/*
  Warnings:

  - You are about to drop the column `date` on the `PageViewSource` table. All the data in the column will be lost.
  - Added the required column `dateUTC` to the `PageViewSource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PageViewSource" DROP COLUMN "date",
ADD COLUMN     "dateUTC" TEXT NOT NULL;
