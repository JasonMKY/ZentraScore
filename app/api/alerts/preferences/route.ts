import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const prefsSchema = z.object({
  scoreChangeEnabled: z.boolean().optional(),
  scoreChangeDelta: z.number().int().min(1).max(200).optional(),
  liquidationEnabled: z.boolean().optional(),
  liquidationHF: z.number().min(1.0).max(3.0).optional(),
  weeklyDigestEnabled: z.boolean().optional(),
  newEligibility: z.boolean().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { alertPrefs: true },
  });

  return NextResponse.json({ prefs: user?.alertPrefs ?? null });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let parsed;
  try {
    parsed = prefsSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid preference values." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const prefs = await db.alertPrefs.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed },
    update: parsed,
  });

  return NextResponse.json({ prefs });
}
