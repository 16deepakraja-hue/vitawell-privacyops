import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET /api/vendors?q=&location=US&dpa=true
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const location = sp.get("location") ?? undefined;
  const dpa = sp.get("dpa");

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

  const data = await prisma.vendor.findMany({
    where,
    include: { activities: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ count: data.length, data });
}
