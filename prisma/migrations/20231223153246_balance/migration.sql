-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
