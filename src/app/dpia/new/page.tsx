import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { DpiaForm } from "@/components/dpia/DpiaForm";

export const dynamic = "force-dynamic";

export default async function NewDpiaPage() {
  const [subjects, categories, vendors] = await Promise.all([
    prisma.dataSubject.findMany({ orderBy: { category: "asc" } }),
    prisma.dataCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="New DPIA" description="Screen a processing project and auto-generate its risk register.">
        <Link href="/dpia" className="text-sm font-medium text-brand-700 hover:underline">
          ← Back to DPIAs
        </Link>
      </PageHeader>

      <DpiaForm
        subjects={subjects.map((s) => ({ id: s.id, label: s.category }))}
        categories={categories.map((c) => ({
          id: c.id,
          label: c.name,
          isSpecial: c.type === "SPECIAL",
          isBiometric: c.type === "BIOMETRIC",
        }))}
        vendors={vendors.map((v) => ({ id: v.id, label: v.name }))}
      />
    </div>
  );
}
