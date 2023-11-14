-- CreateTable
CREATE TABLE "DailyStats" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "newPaidUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsersDelta" INTEGER NOT NULL DEFAULT 0,
    "newPaidUsersDelta" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStats_pkey" PRIMARY KEY ("id")
);
