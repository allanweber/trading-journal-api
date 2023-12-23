-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" VARCHAR(5) NOT NULL,
    "currentBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);
