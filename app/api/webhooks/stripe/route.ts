// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripePriceToPlan } from "@/lib/billing/stripePricePlans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe-webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (userId && plan) {
          await db.user.update({
            where: { id: userId },
            data: {
              plan: plan as any,
              stripeSubId: session.subscription as string,
            },
          });
          console.log(`[stripe-webhook] User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price?.id;
        const plan = stripePriceToPlan(priceId);
        const userId = sub.metadata?.userId;

        if (userId && plan) {
          await db.user.update({
            where: { id: userId },
            data: { plan: plan as any },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: { plan: "FREE", stripeSubId: null },
          });
          console.log(`[stripe-webhook] User ${userId} subscription cancelled`);
        }
        break;
      }

      case "invoice.payment_failed": {
        // Optionally notify user via alert
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[stripe-webhook] Payment failed for customer ${invoice.customer}`);
        break;
      }

      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return NextResponse.json(
      { error: "handler_error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
