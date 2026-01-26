-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "GlobalNotification" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "GlobalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GlobalNotification_isActive_idx" ON "GlobalNotification"("isActive");

-- CreateIndex
CREATE INDEX "GlobalNotification_createdAt_idx" ON "GlobalNotification"("createdAt");
