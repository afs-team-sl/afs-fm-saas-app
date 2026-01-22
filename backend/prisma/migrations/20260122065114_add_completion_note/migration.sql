/*
  Warnings:

  - A unique constraint covering the columns `[joinCode]` on the table `Tenant` will be added. If there are existing duplicate values, this will fail.
  - The required column `joinCode` was added to the `Tenant` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "joinCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "completionNote" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_joinCode_key" ON "Tenant"("joinCode");
