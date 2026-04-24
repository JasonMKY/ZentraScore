import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { stripeCustomerId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      {
        error: "no_subscription",
        message: "Subscribe to a paid plan before managing billing.",
      },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[billing-portal] Stripe error:", err);
    return NextResponse.json(
      { error: "portal_failed", message: "Failed to open billing portal." },
      { status: 500 }
    );
  }
}
