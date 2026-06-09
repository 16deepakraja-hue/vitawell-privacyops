import { NextRequest, NextResponse } from "next/server";
import { Prisma, DataType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// GET /api/data-categories?q=&type=SPECIAL&collected=true
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const type = sp.get("type") ?? undefined;
  const typeValue = type && type in DataType ? DataType[type as keyof typeof DataType] : undefined;
  const collected = sp.get("collected");

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

  const data = await prisma.dataCategory.findMany({
    where,
    include: { activities: true, retention: true },
    orderBy: { type: "asc" },
  });

  return NextResponse.json({ count: data.length, data });
}
