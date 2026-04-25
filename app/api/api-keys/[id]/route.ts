import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const key = await db.apiKey.findFirst({
    where: { id: params.id, userId: user.id },
    select: { id: true, active: true },
  });
  if (!key) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (!key.active) return NextResponse.json({ deleted: true });

  await db.apiKey.update({
    where: { id: key.id },
    data: { active: false, revokedAt: new Date() },
  });

  return NextResponse.json({ deleted: true });
}

