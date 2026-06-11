import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Body = {
  riskId?: string;
  description?: string;
  owner?: string;
  dueDate?: string | null;
};

// POST /api/mitigations — add a mitigation action to a risk.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  if (!body.riskId || !body.description?.trim() || !body.owner?.trim()) {
    return NextResponse.json(
      { error: "riskId, description and owner are required" },
      { status: 400 }
    );
  }
  const mitigation = await prisma.mitigationAction.create({
    data: {
      riskId: body.riskId,
      description: body.description.trim(),
      owner: body.owner.trim(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return NextResponse.json({ data: mitigation }, { status: 201 });
}
