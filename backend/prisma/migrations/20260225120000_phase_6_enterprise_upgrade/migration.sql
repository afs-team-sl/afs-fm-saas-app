-- CreateTable: Supplier Model for vendor/supplier management
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contactPerson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- AlterTable: Add Enterprise fields to User
ALTER TABLE "User" ADD COLUMN     "jobTitle" TEXT;

-- AlterTable: Add Enterprise fields to Asset
ALTER TABLE "Asset" ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "image" TEXT;

-- AlterTable: Add Enterprise fields to Part
ALTER TABLE "Part" ADD COLUMN     "location" TEXT,
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "uom" TEXT NOT NULL DEFAULT 'Each';

-- AlterTable: Add Enterprise fields to WorkOrder
ALTER TABLE "WorkOrder" ADD COLUMN     "checklistData" JSONB,
ADD COLUMN     "legacyId" TEXT;

-- CreateIndex: Index for Supplier name
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex: Index for Part supplierId
CREATE INDEX "Part_supplierId_idx" ON "Part"("supplierId");

-- CreateIndex: Unique constraint for WorkOrder legacyId
CREATE UNIQUE INDEX "WorkOrder_legacyId_key" ON "WorkOrder"("legacyId");

-- AddForeignKey: Link Part to Supplier
ALTER TABLE "Part" ADD CONSTRAINT "Part_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
