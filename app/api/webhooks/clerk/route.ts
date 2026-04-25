// app/api/webhooks/clerk/route.ts
// Syncs Clerk user events to our PostgreSQL database.
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

async function upsertUserFromClerkEvent(params: {
  clerkId: string;
  email: string;
  name: string | null;
}) {
  const { clerkId, email, name } = params;

  const existingByClerk = await db.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (existingByClerk) {
    await db.user.update({
      where: { id: existingByClerk.id },
      data: { email, name },
    });
    return;
  }

  const existingByEmail = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingByEmail) {
    await db.user.update({
      where: { id: existingByEmail.id },
      data: { clerkId, email, name },
    });
    await db.alertPrefs.upsert({
      where: { userId: existingByEmail.id },
      create: { userId: existingByEmail.id },
      update: {},
    });
    return;
  }

  await db.user.create({
    data: {
      clerkId,
      email,
      name,
      alertPrefs: { create: {} },
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const svixId = req.headers.get("svix-id")!;
  const svixTimestamp = req.headers.get("svix-timestamp")!;
  const svixSignature = req.headers.get("svix-signature")!;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing_svix_headers" }, { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[clerk-webhook] CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  let event: { type: string; data: any };
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as any;
  } catch {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "user.created": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;
      if (!email) break;

      await upsertUserFromClerkEvent({
        clerkId: id,
        email,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
      });
      console.log(`[clerk-webhook] User created: ${email}`);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;
      if (!email) break;

      await upsertUserFromClerkEvent({
        clerkId: id,
        email,
        name: [first_name, last_name].filter(Boolean).join(" ") || null,
      });
      break;
    }

    case "user.deleted": {
      await db.user.delete({ where: { clerkId: event.data.id } }).catch(() => {});
      break;
    }
  }

  return NextResponse.json({ received: true });
}
