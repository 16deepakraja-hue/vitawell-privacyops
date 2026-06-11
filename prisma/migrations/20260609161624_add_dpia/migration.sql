-- CreateEnum
CREATE TYPE "DpiaStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RiskCategory" AS ENUM ('HEALTH_DATA', 'BIOMETRIC_DATA', 'CROSS_BORDER', 'AUTOMATED_DECISION', 'LARGE_SCALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MitigationStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "DPIA" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "businessOwner" TEXT NOT NULL,
    "status" "DpiaStatus" NOT NULL DEFAULT 'DRAFT',
    "internationalTransfers" BOOLEAN NOT NULL DEFAULT false,
    "automatedDecisionMaking" BOOLEAN NOT NULL DEFAULT false,
    "specialCategoryData" BOOLEAN NOT NULL DEFAULT false,
    "largeScale" BOOLEAN NOT NULL DEFAULT false,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DPIA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "dpiaId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RiskCategory" NOT NULL DEFAULT 'OTHER',
    "likelihood" INTEGER NOT NULL DEFAULT 3,
    "impact" INTEGER NOT NULL DEFAULT 3,
    "score" INTEGER NOT NULL DEFAULT 9,
    "level" "RiskLevel" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitigationAction" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" "MitigationStatus" NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MitigationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DpiaSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DpiaCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_DpiaVendors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DpiaSubjects_AB_unique" ON "_DpiaSubjects"("A", "B");

-- CreateIndex
CREATE INDEX "_DpiaSubjects_B_index" ON "_DpiaSubjects"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DpiaCategories_AB_unique" ON "_DpiaCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_DpiaCategories_B_index" ON "_DpiaCategories"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DpiaVendors_AB_unique" ON "_DpiaVendors"("A", "B");

-- CreateIndex
CREATE INDEX "_DpiaVendors_B_index" ON "_DpiaVendors"("B");

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_dpiaId_fkey" FOREIGN KEY ("dpiaId") REFERENCES "DPIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitigationAction" ADD CONSTRAINT "MitigationAction_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaSubjects" ADD CONSTRAINT "_DpiaSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "DPIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaSubjects" ADD CONSTRAINT "_DpiaSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "DataSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaCategories" ADD CONSTRAINT "_DpiaCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "DPIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaCategories" ADD CONSTRAINT "_DpiaCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "DataCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaVendors" ADD CONSTRAINT "_DpiaVendors_A_fkey" FOREIGN KEY ("A") REFERENCES "DPIA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DpiaVendors" ADD CONSTRAINT "_DpiaVendors_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
