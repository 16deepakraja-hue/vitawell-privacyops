import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// GET /api/dpia/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const dpia = await prisma.dPIA.findUnique({
    where: { id: params.id },
    include: {
      dataSubjects: true,
      dataCategories: true,
      vendors: true,
      risks: { include: { mitigations: true }, orderBy: { score: "desc" } },
    },
  });
  if (!dpia) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: dpia });
}

// PATCH /api/dpia/[id] — update the workflow status.
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const status = body.status as string | undefined;
  const allowed = ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"];
  if (!status || !allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const dpia = await prisma.dPIA.update({
    where: { id: params.id },
    data: { status: status as never },
  });
  return NextResponse.json({ data: dpia });
}

// DELETE /api/dpia/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.dPIA.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
