-- CreateTable
CREATE TABLE "Plans" (
    "id" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "Users" (
    "email" VARCHAR(255) NOT NULL,
    "planId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Plans_id_key" ON "Plans"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
