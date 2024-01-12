/*
  Warnings:

  - You are about to drop the column `journalId` on the `Balance` table. All the data in the column will be lost.
  - You are about to drop the column `journalId` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the `Journal` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `portfolioId` to the `Balance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `portfolioId` to the `Entry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_journalId_fkey";

-- DropForeignKey
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_journalId_fkey";

-- AlterTable
ALTER TABLE "Balance" DROP COLUMN "journalId",
ADD COLUMN     "portfolioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "journalId",
ADD COLUMN     "portfolioId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Journal";

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "user" VARCHAR(150) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "startDate" TIMESTAMP(3) NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(5) NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
