import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET /api/data-subjects?q=&vulnerable=true
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const vulnerable = sp.get("vulnerable");

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

  const data = await prisma.dataSubject.findMany({
    where,
    include: { activities: true },
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ count: data.length, data });
}
