import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/StatCard";
import { Badge, riskTone } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    activityCount,
    subjectCount,
    categoryCount,
    vendorCount,
    retentionCount,
    highRisk,
    crossBorderCount,
    specialCategoryCount,
    usVendorCount,
  ] = await Promise.all([
    prisma.processingActivity.count(),
    prisma.dataSubject.count(),
    prisma.dataCategory.count(),
    prisma.vendor.count(),
    prisma.retentionSchedule.count(),
    prisma.processingActivity.findMany({
      where: { riskLevel: "HIGH" },
      orderBy: { name: "asc" },
    }),
    prisma.processingActivity.count({ where: { crossBorder: true } }),
    prisma.dataCategory.count({ where: { type: "SPECIAL" } }),
    prisma.vendor.count({ where: { location: { contains: "US" } } }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Mapping Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          VitaWell Health Technologies — record of processing across India and the EU, governed by
          UK/EU GDPR and India&apos;s DPDP Act 2023.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Processing Activities" value={activityCount} href="/processing-activities" />
        <StatCard label="Data Subjects" value={subjectCount} href="/data-subjects" />
        <StatCard label="Data Categories" value={categoryCount} href="/data-categories" />
        <StatCard label="Vendors" value={vendorCount} href="/vendors" />
        <StatCard label="Retention Rules" value={retentionCount} href="/retention" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Cross-border activities"
          value={crossBorderCount}
          hint="Require Chapter V safeguards (SCCs)"
        />
        <StatCard
          label="Special-category data"
          value={specialCategoryCount}
          hint="GDPR Art. 9 health data"
        />
        <StatCard
          label="US-based processors"
          value={usVendorCount}
          hint="Need SCCs / EU-US DPF"
        />
      </div>

      <section className="mt-8 rounded-xl border border-red-200 bg-red-50/50 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-700">
          High-risk processing (DPIA candidates)
        </h2>
        <p className="mt-1 text-sm text-red-700/80">
          Activities combining special-category health data, large scale, vulnerable subjects, new
          technology or cross-border transfers.
        </p>
        <ul className="mt-4 space-y-3">
          {highRisk.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-red-100 bg-white p-4"
            >
              <div>
                <Link
                  href="/processing-activities"
                  className="font-medium text-gray-900 hover:text-brand-700"
                >
                  {a.name}
                </Link>
                <p className="mt-0.5 text-sm text-gray-500">{a.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge tone={riskTone(a.riskLevel)}>{a.riskLevel} RISK</Badge>
                {a.crossBorder && <Badge tone="blue">Cross-border</Badge>}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
