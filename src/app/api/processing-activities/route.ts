import { NextRequest, NextResponse } from "next/server";
import { Prisma, RiskLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET /api/processing-activities?q=&risk=HIGH&crossBorder=true
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const risk = sp.get("risk") ?? undefined;
  const riskValue = risk && risk in RiskLevel ? RiskLevel[risk as keyof typeof RiskLevel] : undefined;
  const crossBorder = sp.get("crossBorder");

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

  const data = await prisma.processingActivity.findMany({
    where,
    include: { dataSubjects: true, dataCategories: true, vendors: true, systems: true },
    orderBy: [{ riskLevel: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ count: data.length, data });
}
