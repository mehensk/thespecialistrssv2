-- CreateEnum
CREATE TYPE "CloudinaryDeleteStatus" AS ENUM ('PENDING', 'PROCESSING', 'FAILED', 'COMPLETED');

-- CreateTable
CREATE TABLE "CloudinaryDeleteQueue" (
    "id" TEXT NOT NULL,
    "listingId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "status" "CloudinaryDeleteStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextRetryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CloudinaryDeleteQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CloudinaryDeleteQueue_status_nextRetryAt_idx" ON "CloudinaryDeleteQueue"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "CloudinaryDeleteQueue_listingId_idx" ON "CloudinaryDeleteQueue"("listingId");

-- CreateIndex
CREATE INDEX "CloudinaryDeleteQueue_publicId_idx" ON "CloudinaryDeleteQueue"("publicId");
