-- CreateTable
CREATE TABLE "EntryImages" (
    "imageId" VARCHAR(255) NOT NULL,
    "entryId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" VARCHAR(255) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EntryImages_imageId_key" ON "EntryImages"("imageId");

-- AddForeignKey
ALTER TABLE "EntryImages" ADD CONSTRAINT "EntryImages_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
