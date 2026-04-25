import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveRequestPrincipal } from "@/lib/requestAuth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const principal = await resolveRequestPrincipal(req);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const webhook = await db.webhookEndpoint.findFirst({
    where: { id: params.id, userId: principal.userId },
    select: { id: true },
  });

  if (!webhook) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.webhookEndpoint.delete({ where: { id: webhook.id } });
  return NextResponse.json({ deleted: true });
}

