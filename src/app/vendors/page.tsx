import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/PageHeader";
import { Toolbar } from "@/components/Toolbar";
import { DataTable, Column } from "@/components/DataTable";
import { Badge } from "@/components/Badge";

export const dynamic = "force-dynamic";

type SearchParams = { q?: string; location?: string; dpa?: string };

type Vendor = Prisma.VendorGetPayload<{ include: { activities: true } }>;

export default async function VendorsPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, location, dpa } = searchParams;

  const where: Prisma.VendorWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { role: { contains: q, mode: "insensitive" } },
              { dataShared: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      location ? { location: { contains: location, mode: "insensitive" } } : {},
      dpa === "true" ? { hasDPA: true } : dpa === "false" ? { hasDPA: false } : {},
    ],
  };

  const vendors = (await prisma.vendor.findMany({
    where,
    include: { activities: true },
    orderBy: { name: "asc" },
  })) as Vendor[];

  const columns: Column<Vendor>[] = [
    { header: "Vendor", cell: (v) => <span className="font-medium text-gray-900">{v.name}</span> },
    { header: "Role", cell: (v) => <span className="text-gray-600">{v.role}</span> },
    {
      header: "Location",
      cell: (v) => (
        <Badge tone={v.location.includes("US") ? "amber" : "green"}>{v.location}</Badge>
      ),
    },
    { header: "Data shared", cell: (v) => <span className="text-gray-600">{v.dataShared}</span> },
    {
      header: "Transfer safeguard",
      cell: (v) =>
        v.transferSafeguard ? (
          <span className="text-xs text-gray-600">{v.transferSafeguard}</span>
        ) : (
          <span className="text-xs text-gray-400">— (domestic)</span>
        ),
    },
    {
      header: "DPA",
      cell: (v) => (v.hasDPA ? <Badge tone="green">In place</Badge> : <Badge tone="red">Missing</Badge>),
    },
    {
      header: "Used in",
      cell: (v) => (
        <div className="flex flex-wrap gap-1">
          {v.activities.map((a) => (
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
        title="Vendors"
        description="Third-party processors and sub-processors, the data they receive, and their cross-border transfer safeguards."
      />
      <Toolbar
        searchPlaceholder="Search vendors…"
        filters={[
          {
            key: "location",
            label: "Location",
            options: [
              { value: "US", label: "US" },
              { value: "EU", label: "EU" },
              { value: "India", label: "India" },
            ],
          },
          {
            key: "dpa",
            label: "DPA",
            options: [
              { value: "true", label: "In place" },
              { value: "false", label: "Missing" },
            ],
          },
        ]}
      />
      <DataTable columns={columns} rows={vendors} />
    </div>
  );
}
