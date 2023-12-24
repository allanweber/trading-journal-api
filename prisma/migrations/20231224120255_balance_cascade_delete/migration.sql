-- DropForeignKey
ALTER TABLE "Balance" DROP CONSTRAINT "Balance_journalId_fkey";

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
