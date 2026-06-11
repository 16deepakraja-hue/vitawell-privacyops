import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// DELETE /api/risks/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.risk.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
