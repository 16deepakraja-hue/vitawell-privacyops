import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Toolbar } from "@/components/Toolbar";
import { DataTable, Column } from "@/components/DataTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; vulnerable?: string };

type Subject = Prisma.DataSubjectGetPayload<{ include: { activities: true } }>;

export default async function DataSubjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, vulnerable } = searchParams;

  const where: Prisma.DataSubjectWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { category: { contains: q, mode: "insensitive" } },
              { examples: { contains: q, mode: "insensitive" } },
              { notes: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      vulnerable === "true" ? { isVulnerable: true } : {},
    ],
  };

  const subjects = (await prisma.dataSubject.findMany({
    where,
    include: { activities: true },
    orderBy: { category: "asc" },
  })) as Subject[];

  const columns: Column<Subject>[] = [
    {
      header: "Category",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{s.category}</span>
          {s.isVulnerable && <Badge tone="amber">Vulnerable</Badge>}
        </div>
      ),
    },
    { header: "Examples", cell: (s) => <span className="text-gray-600">{s.examples}</span> },
    { header: "Notes", cell: (s) => <span className="text-gray-500">{s.notes}</span> },
    {
      header: "Used in",
      cell: (s) => (
        <div className="flex flex-wrap gap-1">
          {s.activities.map((a) => (
            <Badge key={a.id} tone="gray">
              {a.name}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Data Subjects"
        description="The categories of people whose personal data VitaWell holds, and where each is processed."
      />
      <Toolbar
        searchPlaceholder="Search data subjects…"
        filters={[
          { key: "vulnerable", label: "Vulnerable", options: [{ value: "true", label: "Yes" }] },
        ]}
      />
      <DataTable columns={columns} rows={subjects} />
    </div>
  );
}
