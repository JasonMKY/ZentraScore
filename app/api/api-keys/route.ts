import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateApiKeyValue, hashApiKey } from "@/lib/apiKeys";
import type { SubscriptionPlan } from "@/types";

const createSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
});

const API_KEY_PLANS: SubscriptionPlan[] = ["PROTOCOL", "ANALYTICS"];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  if (!API_KEY_PLANS.includes(user.plan as SubscriptionPlan)) {
    return NextResponse.json(
      {
        error: "plan_required",
        message: "API keys are available on Protocol API and Risk Analytics plans.",
      },
      { status: 403 }
    );
  }

  const keys = await db.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      active: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });

  return NextResponse.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.keyPrefix,
      active: k.active,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      revokedAt: k.revokedAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  if (!API_KEY_PLANS.includes(user.plan as SubscriptionPlan)) {
    return NextResponse.json(
      {
        error: "plan_required",
        message: "API keys are available on Protocol API and Risk Analytics plans.",
      },
      { status: 403 }
    );
  }

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid API key payload." },
      { status: 400 }
    );
  }

  const { token, prefix } = generateApiKeyValue();
  const keyHash = hashApiKey(token);

  const key = await db.apiKey.create({
    data: {
      userId: user.id,
      name: body.name,
      keyPrefix: prefix,
      keyHash,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      active: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      id: key.id,
      name: key.name,
      prefix: key.keyPrefix,
      active: key.active,
      createdAt: key.createdAt.toISOString(),
      apiKey: token,
    },
    { status: 201 }
  );
}

