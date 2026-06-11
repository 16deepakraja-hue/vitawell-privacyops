import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreDpia, buildRisksFromScore } from "@/lib/risk-engine";

// GET /api/dpia?q=&level=HIGH&status=DRAFT
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const level = sp.get("level") ?? undefined;
  const status = sp.get("status") ?? undefined;

  const data = await prisma.dPIA.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { projectName: { contains: q, mode: "insensitive" } },
                { purpose: { contains: q, mode: "insensitive" } },
                { businessOwner: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        level ? { riskLevel: level as never } : {},
        status ? { status: status as never } : {},
      ],
    },
    include: { risks: true, dataCategories: true },
    orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ count: data.length, data });
}

type CreateBody = {
  projectName?: string;
  purpose?: string;
  businessOwner?: string;
  internationalTransfers?: boolean;
  automatedDecisionMaking?: boolean;
  specialCategoryData?: boolean;
  largeScale?: boolean;
  dataSubjectIds?: string[];
  dataCategoryIds?: string[];
  vendorIds?: string[];
};

// POST /api/dpia — create a DPIA, score it, and generate the risk register.
export async function POST(req: NextRequest) {
  let body: CreateBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const projectName = body.projectName?.trim();
  const purpose = body.purpose?.trim();
  const businessOwner = body.businessOwner?.trim();

  if (!projectName || !purpose || !businessOwner) {
    return NextResponse.json(
      { error: "projectName, purpose and businessOwner are required." },
      { status: 400 }
    );
  }

  const dataCategoryIds = body.dataCategoryIds ?? [];
  const dataSubjectIds = body.dataSubjectIds ?? [];
  const vendorIds = body.vendorIds ?? [];

  // Look at the selected data categories to detect health / biometric data.
  const selectedCategories = dataCategoryIds.length
    ? await prisma.dataCategory.findMany({ where: { id: { in: dataCategoryIds } } })
    : [];
  const hasSpecial = selectedCategories.some((c) => c.type === "SPECIAL");
  const hasBiometric = selectedCategories.some((c) => c.type === "BIOMETRIC");

  const scoring = scoreDpia({
    specialCategoryData: Boolean(body.specialCategoryData) || hasSpecial,
    biometricData: hasBiometric,
    internationalTransfers: Boolean(body.internationalTransfers),
    automatedDecisionMaking: Boolean(body.automatedDecisionMaking),
    largeScale: Boolean(body.largeScale),
  });

  const risks = buildRisksFromScore(scoring);

  const dpia = await prisma.dPIA.create({
    data: {
      projectName,
      purpose,
      businessOwner,
      internationalTransfers: Boolean(body.internationalTransfers),
      automatedDecisionMaking: Boolean(body.automatedDecisionMaking),
      specialCategoryData: Boolean(body.specialCategoryData) || hasSpecial,
      largeScale: Boolean(body.largeScale),
      riskScore: scoring.score,
      riskLevel: scoring.level,
      dataSubjects: { connect: dataSubjectIds.map((id) => ({ id })) },
      dataCategories: { connect: dataCategoryIds.map((id) => ({ id })) },
      vendors: { connect: vendorIds.map((id) => ({ id })) },
      risks: { create: risks },
    },
    include: { risks: true },
  });

  return NextResponse.json({ data: dpia }, { status: 201 });
}
