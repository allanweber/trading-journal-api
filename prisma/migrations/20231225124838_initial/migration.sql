-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('TRADE', 'WITHDRAWAL', 'DEPOSIT', 'TAXES', 'DIVIDEND');

-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "user" VARCHAR(150) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "startDate" TIMESTAMP(3) NOT NULL,
    "startBalance" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(5) NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "balance" DOUBLE PRECISION,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "user" VARCHAR(150) NOT NULL,
    "journalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "notes" VARCHAR(255),
    "symbol" VARCHAR(50),
    "direction" "Direction",
    "size" DOUBLE PRECISION,
    "profit" DOUBLE PRECISION,
    "loss" DOUBLE PRECISION,
    "costs" DOUBLE PRECISION,
    "exitDate" TIMESTAMP(3),
    "exitPrice" DOUBLE PRECISION,
    "result" DOUBLE PRECISION,
    "grossResult" DOUBLE PRECISION,
    "accountChange" DOUBLE PRECISION,
    "accountBalance" DOUBLE PRECISION,
    "accountRisk" DOUBLE PRECISION,
    "plannedRR" DOUBLE PRECISION,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
