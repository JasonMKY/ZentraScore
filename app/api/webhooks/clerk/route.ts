// app/api/webhooks/clerk/route.ts
// Syncs Clerk user events to our PostgreSQL database.
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

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

      await db.user.upsert({
        where: { clerkId: id },
        create: {
          clerkId: id,
          email,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
          alertPrefs: { create: {} }, // create default alert prefs
        },
        update: { email, name: [first_name, last_name].filter(Boolean).join(" ") || null },
      });
      console.log(`[clerk-webhook] User created: ${email}`);
      break;
    }

    case "user.updated": {
      const { id, email_addresses, first_name, last_name } = event.data;
      const email = email_addresses?.[0]?.email_address;
      if (!email) break;

      await db.user.update({
        where: { clerkId: id },
        data: {
          email,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
        },
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
