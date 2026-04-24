import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const url = new URL(req.url);
  const unreadOnly = url.searchParams.get("unread") === "true";
  const rawLimit = parseInt(url.searchParams.get("limit") ?? "50", 10);
  const limit = Math.min(Math.max(1, Number.isNaN(rawLimit) ? 50 : rawLimit), 100);

  const alerts = await db.alert.findMany({
    where: {
      userId: user.id,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await db.alert.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json(
    {
      alerts: alerts.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      })),
      unreadCount,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    }
  );
}

const patchSchema = z
  .object({
    alertIds: z.array(z.string()).min(1).optional(),
    markAll: z.boolean().optional(),
  })
  .refine((d) => d.markAll || (d.alertIds && d.alertIds.length > 0), {
    message: "Provide alertIds or set markAll: true",
  });

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Provide alertIds array or markAll: true." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  if (body.markAll) {
    await db.alert.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } else if (body.alertIds && body.alertIds.length > 0) {
    await db.alert.updateMany({
      where: { id: { in: body.alertIds }, userId: user.id },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
