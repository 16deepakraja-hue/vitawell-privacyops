-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "DataType" AS ENUM ('ORDINARY', 'SPECIAL', 'GOV_ID', 'BIOMETRIC');

-- CreateTable
CREATE TABLE "ProcessingActivity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "gdprLegalBasis" TEXT NOT NULL,
    "art9Condition" TEXT,
    "dpdpBasis" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "crossBorder" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessingActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSubject" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "examples" TEXT NOT NULL,
    "notes" TEXT,
    "isVulnerable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DataType" NOT NULL DEFAULT 'ORDINARY',
    "examples" TEXT NOT NULL,
    "collected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "dataShared" TEXT NOT NULL,
    "hasDPA" BOOLEAN NOT NULL DEFAULT true,
    "transferSafeguard" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "dataHeld" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetentionSchedule" (
    "id" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "driver" TEXT NOT NULL,
    "dataCategoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ActivityVendors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ActivitySystems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ActivitySubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ActivityCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessingActivity_name_key" ON "ProcessingActivity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DataSubject_category_key" ON "DataSubject"("category");

-- CreateIndex
CREATE UNIQUE INDEX "DataCategory_name_key" ON "DataCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "System_name_key" ON "System"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionSchedule_dataType_key" ON "RetentionSchedule"("dataType");

-- CreateIndex
CREATE UNIQUE INDEX "_ActivityVendors_AB_unique" ON "_ActivityVendors"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivityVendors_B_index" ON "_ActivityVendors"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ActivitySystems_AB_unique" ON "_ActivitySystems"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivitySystems_B_index" ON "_ActivitySystems"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ActivitySubjects_AB_unique" ON "_ActivitySubjects"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivitySubjects_B_index" ON "_ActivitySubjects"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ActivityCategories_AB_unique" ON "_ActivityCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_ActivityCategories_B_index" ON "_ActivityCategories"("B");

-- AddForeignKey
ALTER TABLE "RetentionSchedule" ADD CONSTRAINT "RetentionSchedule_dataCategoryId_fkey" FOREIGN KEY ("dataCategoryId") REFERENCES "DataCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityVendors" ADD CONSTRAINT "_ActivityVendors_A_fkey" FOREIGN KEY ("A") REFERENCES "ProcessingActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityVendors" ADD CONSTRAINT "_ActivityVendors_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivitySystems" ADD CONSTRAINT "_ActivitySystems_A_fkey" FOREIGN KEY ("A") REFERENCES "ProcessingActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivitySystems" ADD CONSTRAINT "_ActivitySystems_B_fkey" FOREIGN KEY ("B") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivitySubjects" ADD CONSTRAINT "_ActivitySubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "DataSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivitySubjects" ADD CONSTRAINT "_ActivitySubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "ProcessingActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityCategories" ADD CONSTRAINT "_ActivityCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "DataCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ActivityCategories" ADD CONSTRAINT "_ActivityCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "ProcessingActivity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
