import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET /api/retention?q=
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;

  const where: Prisma.RetentionScheduleWhereInput = q
    ? {
        OR: [
          { dataType: { contains: q, mode: "insensitive" } },
          { period: { contains: q, mode: "insensitive" } },
          { driver: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const data = await prisma.retentionSchedule.findMany({
    where,
    include: { dataCategory: true },
    orderBy: { dataType: "asc" },
  });

  return NextResponse.json({ count: data.length, data });
}
