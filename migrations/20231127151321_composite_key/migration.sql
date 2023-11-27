/*
  Warnings:

  - The primary key for the `PageViewSource` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PageViewSource` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PageViewSource" DROP CONSTRAINT "PageViewSource_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "PageViewSource_pkey" PRIMARY KEY ("date", "name");
