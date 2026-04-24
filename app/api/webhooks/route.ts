import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

const createWebhookSchema = z.object({
  url: z.string().url().startsWith("https://", "Webhook URL must be HTTPS"),
  addresses: z.array(z.string().regex(/^0x[a-fA-F0-9]{40}$/)).min(1).max(1000),
  events: z
    .array(z.enum(["score.updated", "score.expired", "score.defaulted"]))
    .min(1),
  threshold: z.number().int().min(0).max(550).optional(),
});

const deleteSchema = z.object({
  webhookId: z.string().min(1, "webhookId is required"),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  if (!["PROTOCOL"].includes(user.plan)) {
    return NextResponse.json(
      { error: "plan_required", message: "Webhooks require the Protocol API plan." },
      { status: 403 }
    );
  }

  const webhooks = await db.webhookEndpoint.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    webhooks: webhooks.map((w) => ({
      ...w,
      secret: undefined,
      createdAt: w.createdAt.toISOString(),
      lastFiredAt: w.lastFiredAt?.toISOString() ?? null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  if (!["PROTOCOL"].includes(user.plan)) {
    return NextResponse.json(
      { error: "plan_required", message: "Webhooks require the Protocol API plan." },
      { status: 403 }
    );
  }

  let body;
  try {
    body = createWebhookSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid webhook configuration." },
      { status: 400 }
    );
  }

  const count = await db.webhookEndpoint.count({ where: { userId: user.id } });
  if (count >= 10) {
    return NextResponse.json(
      { error: "limit_reached", message: "Maximum 10 webhook endpoints per account." },
      { status: 400 }
    );
  }

  const secret = `whsec_${randomBytes(24).toString("hex")}`;

  const webhook = await db.webhookEndpoint.create({
    data: {
      userId: user.id,
      url: body.url,
      addresses: body.addresses.map((a) => a.toLowerCase()),
      events: body.events,
      threshold: body.threshold,
      secret,
    },
  });

  return NextResponse.json(
    {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      threshold: webhook.threshold,
      secret,
      createdAt: webhook.createdAt.toISOString(),
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body;
  try {
    body = deleteSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Provide a webhookId string." },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const webhook = await db.webhookEndpoint.findFirst({
    where: { id: body.webhookId, userId: user.id },
  });

  if (!webhook) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.webhookEndpoint.delete({ where: { id: body.webhookId } });
  return NextResponse.json({ deleted: true });
}
