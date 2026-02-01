-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('LITE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "maxAssets" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "plan" "SubscriptionPlan" NOT NULL DEFAULT 'LITE';

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'system',
    "isMaintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "tenantName" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantName_idx" ON "AuditLog"("tenantName");

-- CreateIndex
CREATE INDEX "Tenant_plan_idx" ON "Tenant"("plan");
