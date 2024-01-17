-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('STOCK', 'OPTION', 'CRYPTO', 'FUTURES', 'FOREX', 'INDEX', 'WITHDRAWAL', 'DEPOSIT', 'TAXES', 'DIVIDEND', 'FEES');

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

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "user" VARCHAR(150) NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "entryType" "EntryType" NOT NULL,
    "orderStatus" "OrderStatus" NOT NULL,
    "orderRef" VARCHAR(50) NOT NULL,
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
    "returnPercentage" DOUBLE PRECISION,
    "plannedRR" DOUBLE PRECISION,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
