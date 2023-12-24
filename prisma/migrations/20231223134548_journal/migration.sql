-- CreateTable
CREATE TABLE "Journal" (
    "id" TEXT NOT NULL,
    "user" VARCHAR(150) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(5) NOT NULL,
    "currentBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);
