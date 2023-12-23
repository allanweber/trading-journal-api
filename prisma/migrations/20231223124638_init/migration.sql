/*
  Warnings:

  - You are about to alter the column `startBalance` on the `Journal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `currentBalance` on the `Journal` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Journal" ALTER COLUMN "startBalance" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currentBalance" SET DATA TYPE DECIMAL(10,2);
