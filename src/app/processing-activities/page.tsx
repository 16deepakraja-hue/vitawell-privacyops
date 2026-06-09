import { Prisma, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Toolbar } from "@/components/Toolbar";
import { DataTable, Column } from "@/components/DataTable";
import { Badge, riskTone } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; risk?: string; crossBorder?: string };

type Activity = Prisma.ProcessingActivityGetPayload<{
  include: { dataSubjects: true; dataCategories: true; vendors: true; systems: true };
}>;

export default async function ProcessingActivitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, risk, crossBorder } = searchParams;
  const riskValue = risk && risk in RiskLevel ? RiskLevel[risk as keyof typeof RiskLevel] : undefined;

  const where: Prisma.ProcessingActivityWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { purpose: { contains: q, mode: "insensitive" } },
              { gdprLegalBasis: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      riskValue ? { riskLevel: riskValue } : {},
      crossBorder === "true" ? { crossBorder: true } : {},
    ],
  };

  const activities = (await prisma.processingActivity.findMany({
    where,
    include: { dataSubjects: true, dataCategories: true, vendors: true, systems: true },
    orderBy: [{ riskLevel: "desc" }, { name: "asc" }],
  })) as Activity[];

  const columns: Column<Activity>[] = [
    {
      header: "Activity",
      cell: (a) => (
        <div>
          <div className="font-medium text-gray-900">{a.name}</div>
          <div className="mt-0.5 max-w-md text-xs text-gray-500">{a.description}</div>
        </div>
      ),
    },
    {
      header: "Legal basis",
      cell: (a) => (
        <div className="space-y-1 text-xs">
          <div>
            <span className="text-gray-400">GDPR: </span>
            {a.gdprLegalBasis}
          </div>
          {a.art9Condition && (
            <div>
              <span className="text-gray-400">Art. 9: </span>
              {a.art9Condition}
            </div>
          )}
          <div>
            <span className="text-gray-400">DPDP: </span>
            {a.dpdpBasis}
          </div>
        </div>
      ),
    },
    {
      header: "Subjects",
      cell: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.dataSubjects.map((s) => (
            <Badge key={s.id} tone={s.isVulnerable ? "amber" : "gray"}>
              {s.category}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Data",
      cell: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.dataCategories.map((c) => (
            <Badge key={c.id} tone={c.type === "SPECIAL" ? "red" : c.type === "GOV_ID" ? "purple" : "blue"}>
              {c.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Vendors",
      cell: (a) => (
        <div className="flex flex-wrap gap-1">
          {a.vendors.map((v) => (
            <Badge key={v.id} tone="gray">
              {v.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Risk",
      cell: (a) => (
        <div className="flex flex-col items-start gap-1">
          <Badge tone={riskTone(a.riskLevel)}>{a.riskLevel}</Badge>
          {a.crossBorder && <Badge tone="blue">Cross-border</Badge>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Processing Activities"
        description="Each business process that involves personal data, with its purpose, legal bases, the people and data involved, and the processors used."
      />
      <Toolbar
        searchPlaceholder="Search activities…"
        filters={[
          {
            key: "risk",
            label: "Risk",
            options: [
              { value: "HIGH", label: "High" },
              { value: "MEDIUM", label: "Medium" },
              { value: "LOW", label: "Low" },
            ],
          },
          {
            key: "crossBorder",
            label: "Cross-border",
            options: [{ value: "true", label: "Yes" }],
          },
        ]}
      />
      <DataTable columns={columns} rows={activities} />
    </div>
  );
}
