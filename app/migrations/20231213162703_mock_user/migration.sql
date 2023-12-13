-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isMockUser" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "isAdmin" SET DEFAULT true;
