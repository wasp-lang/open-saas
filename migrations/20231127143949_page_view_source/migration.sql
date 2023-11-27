-- CreateTable
CREATE TABLE "PageViewSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "visitors" INTEGER NOT NULL,
    "dailyStatsId" INTEGER,

    CONSTRAINT "PageViewSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageViewSource_name_key" ON "PageViewSource"("name");

-- AddForeignKey
ALTER TABLE "PageViewSource" ADD CONSTRAINT "PageViewSource_dailyStatsId_fkey" FOREIGN KEY ("dailyStatsId") REFERENCES "DailyStats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
