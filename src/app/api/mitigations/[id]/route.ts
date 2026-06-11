import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// PATCH /api/mitigations/[id] — update status (or other editable fields).
export async function PATCH(req: NextRequest, { params }: Params) {
  const body = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    const allowed = ["OPEN", "IN_PROGRESS", "COMPLETED"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.description !== undefined) data.description = String(body.description).trim();
  if (body.owner !== undefined) data.owner = String(body.owner).trim();
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const mitigation = await prisma.mitigationAction.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ data: mitigation });
}

// DELETE /api/mitigations/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.mitigationAction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
