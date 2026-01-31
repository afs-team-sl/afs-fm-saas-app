-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "laborHours" DOUBLE PRECISION,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "WorkOrder_dueDate_idx" ON "WorkOrder"("dueDate");
