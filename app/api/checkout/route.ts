import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const PRICE_MAP: Record<string, string> = {
  CONSUMER: process.env.STRIPE_PRICE_CONSUMER!,
  PROTOCOL: process.env.STRIPE_PRICE_PROTOCOL!,
  ANALYTICS: process.env.STRIPE_PRICE_ANALYTICS!,
};

const bodySchema = z.object({
  plan: z.enum(["CONSUMER", "PROTOCOL", "ANALYTICS"]),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_plan", message: "Provide a valid plan: CONSUMER, PROTOCOL, or ANALYTICS." },
      { status: 400 }
    );
  }

  const priceId = PRICE_MAP[body.plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "missing_price", message: "Stripe price ID not configured for this plan." },
      { status: 500 }
    );
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, email: true, stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  try {
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { clerkId: userId, userId: user.id },
      });
      customerId = customer.id;
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true&plan=${body.plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: { userId: user.id, plan: body.plan },
      subscription_data: {
        metadata: { userId: user.id, plan: body.plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return NextResponse.json(
      { error: "checkout_failed", message: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
