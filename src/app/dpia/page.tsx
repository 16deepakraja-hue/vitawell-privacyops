import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Toolbar } from "@/components/Toolbar";
import { Badge, riskTone } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; level?: string; status?: string };

const statusTone: Record<string, "gray" | "blue" | "green" | "red"> = {
  DRAFT: "gray",
  IN_REVIEW: "blue",
  APPROVED: "green",
  REJECTED: "red",
};

export default async function DpiaListPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, level, status } = searchParams;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { projectName: { contains: q, mode: "insensitive" as const } },
              { purpose: { contains: q, mode: "insensitive" as const } },
              { businessOwner: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {},
      level ? { riskLevel: level as never } : {},
      status ? { status: status as never } : {},
    ],
  };

  const [dpias, total, high, medium, low, openMitigations] = await Promise.all([
    prisma.dPIA.findMany({
      where,
      include: { risks: true, _count: { select: { risks: true } } },
      orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
    }),
    prisma.dPIA.count(),
    prisma.dPIA.count({ where: { riskLevel: "HIGH" } }),
    prisma.dPIA.count({ where: { riskLevel: "MEDIUM" } }),
    prisma.dPIA.count({ where: { riskLevel: "LOW" } }),
    prisma.mitigationAction.count({ where: { status: { not: "COMPLETED" } } }),
  ]);

  return (
    <div>
      <PageHeader
        title="DPIA Register"
        description="Data Protection Impact Assessments and their risk scores (GDPR Art. 35)."
      >
        <Link
          href="/dpia/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          + New DPIA
        </Link>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total DPIAs" value={total} />
        <StatCard label="High risk" value={high} hint="Score 61–100" />
        <StatCard label="Medium risk" value={medium} hint="Score 31–60" />
        <StatCard label="Low risk" value={low} hint="Score 0–30" />
        <StatCard label="Open mitigations" value={openMitigations} hint="Not yet completed" />
      </div>

      <Toolbar
        searchPlaceholder="Search DPIAs…"
        filters={[
          {
            key: "level",
            label: "Risk",
            options: [
              { value: "HIGH", label: "High" },
              { value: "MEDIUM", label: "Medium" },
              { value: "LOW", label: "Low" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "DRAFT", label: "Draft" },
              { value: "IN_REVIEW", label: "In review" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dpias.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            No DPIAs match your search. <Link href="/dpia/new" className="text-brand-700">Create one</Link>.
          </p>
        )}
        {dpias.map((d) => (
          <Link
            key={d.id}
            href={`/dpia/${d.id}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-700">
                {d.projectName}
              </h3>
              <Badge tone={riskTone(d.riskLevel)}>{d.riskLevel}</Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{d.purpose}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Badge tone={statusTone[d.status]}>{d.status.replace("_", " ")}</Badge>
                <span>{d._count.risks} risks</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">{d.riskScore}</span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${
                  d.riskLevel === "HIGH"
                    ? "bg-red-500"
                    : d.riskLevel === "MEDIUM"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${d.riskScore}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
