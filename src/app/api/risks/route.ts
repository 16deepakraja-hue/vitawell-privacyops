import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { levelForRiskScore } from "@/lib/risk-engine";

type Body = {
  dpiaId?: string;
  title?: string;
  description?: string;
  category?: string;
  likelihood?: number;
  impact?: number;
};

const clamp = (n: number, min = 1, max = 5) => Math.max(min, Math.min(max, Math.round(n)));

// POST /api/risks — add a manual risk to a DPIA's register.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.dpiaId || !body.title?.trim()) {
    return NextResponse.json({ error: "dpiaId and title are required" }, { status: 400 });
  }
  const likelihood = clamp(body.likelihood ?? 3);
  const impact = clamp(body.impact ?? 3);
  const score = likelihood * impact;

  const risk = await prisma.risk.create({
    data: {
      dpiaId: body.dpiaId,
      title: body.title.trim(),
      description: body.description?.trim() ?? "",
      category: (body.category as never) ?? "OTHER",
      likelihood,
      impact,
      score,
      level: levelForRiskScore(score),
    },
  });
  return NextResponse.json({ data: risk }, { status: 201 });
}
