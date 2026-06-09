import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Toolbar } from "@/components/Toolbar";
import { DataTable, Column } from "@/components/DataTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string };

type Retention = Prisma.RetentionScheduleGetPayload<{ include: { dataCategory: true } }>;

export default async function RetentionPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = searchParams;

  const where: Prisma.RetentionScheduleWhereInput = q
    ? {
        OR: [
          { dataType: { contains: q, mode: "insensitive" } },
          { period: { contains: q, mode: "insensitive" } },
          { driver: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const rows = (await prisma.retentionSchedule.findMany({
    where,
    include: { dataCategory: true },
    orderBy: { dataType: "asc" },
  })) as Retention[];

  const columns: Column<Retention>[] = [
    {
      header: "Data type",
      cell: (r) => <span className="font-medium text-gray-900">{r.dataType}</span>,
    },
    { header: "Retention period", cell: (r) => <span className="text-gray-600">{r.period}</span> },
    { header: "Driver", cell: (r) => <Badge tone="purple">{r.driver}</Badge> },
    {
      header: "Linked category",
      cell: (r) =>
        r.dataCategory ? (
          <Badge tone="blue">{r.dataCategory.name}</Badge>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Retention Schedule"
        description="How long each class of data is kept and the legal or policy driver behind it."
      />
      <Toolbar searchPlaceholder="Search retention rules…" />
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
