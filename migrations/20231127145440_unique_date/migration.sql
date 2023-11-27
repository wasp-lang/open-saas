/*
  Warnings:

  - You are about to drop the column `dat` on the `PageViewSource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date]` on the table `PageViewSource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PageViewSource" DROP COLUMN "dat",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "PageViewSource_date_key" ON "PageViewSource"("date");
