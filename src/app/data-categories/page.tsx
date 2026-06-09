import { Prisma, DataType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Toolbar } from "@/components/Toolbar";
import { DataTable, Column } from "@/components/DataTable";
import { Badge, dataTypeTone } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; type?: string; collected?: string };

type Category = Prisma.DataCategoryGetPayload<{
  include: { activities: true; retention: true };
}>;

const typeLabels: Record<string, string> = {
  ORDINARY: "Ordinary",
  SPECIAL: "Special category",
  GOV_ID: "Government ID",
  BIOMETRIC: "Biometric / genetic",
};

export default async function DataCategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, type, collected } = searchParams;
  const typeValue = type && type in DataType ? DataType[type as keyof typeof DataType] : undefined;

  const where: Prisma.DataCategoryWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { examples: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      typeValue ? { type: typeValue } : {},
      collected === "true" ? { collected: true } : collected === "false" ? { collected: false } : {},
    ],
  };

  const categories = (await prisma.dataCategory.findMany({
    where,
    include: { activities: true, retention: true },
    orderBy: { type: "asc" },
  })) as Category[];

  const columns: Column<Category>[] = [
    {
      header: "Category",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{c.name}</span>
          {!c.collected && <Badge tone="gray">Not collected</Badge>}
        </div>
      ),
    },
    { header: "Type", cell: (c) => <Badge tone={dataTypeTone(c.type)}>{typeLabels[c.type]}</Badge> },
    { header: "Examples", cell: (c) => <span className="text-gray-600">{c.examples}</span> },
    {
      header: "Activities",
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.activities.map((a) => (
            <Badge key={a.id} tone="gray">
              {a.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Retention",
      cell: (c) => (
        <div className="flex flex-wrap gap-1">
          {c.retention.map((r) => (
            <Badge key={r.id} tone="blue">
              {r.period}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Data Categories"
        description="The categories of personal data VitaWell collects, classified by sensitivity tier."
      />
      <Toolbar
        searchPlaceholder="Search data categories…"
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { value: "ORDINARY", label: "Ordinary" },
              { value: "SPECIAL", label: "Special category" },
              { value: "GOV_ID", label: "Government ID" },
              { value: "BIOMETRIC", label: "Biometric" },
            ],
          },
          {
            key: "collected",
            label: "Collected",
            options: [
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ],
          },
        ]}
      />
      <DataTable columns={columns} rows={categories} />
    </div>
  );
}
