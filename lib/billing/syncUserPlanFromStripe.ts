import Stripe from "stripe";
import { db } from "@/lib/db";
import type { SubscriptionPlan } from "@/types";
import { stripePriceToPlan } from "@/lib/billing/stripePricePlans";

/**
 * If the DB still says FREE but Stripe has an active subscription, update the user
 * and return the paid plan. Otherwise return the current DB plan.
 * Avoids leaving users on the 1-wallet FREE cap after checkout when webhooks lag.
 */
export async function syncUserPlanFromStripe(user: {
  id: string;
  plan: string;
  stripeSubId: string | null;
  stripeCustomerId: string | null;
}): Promise<SubscriptionPlan> {
  const current = user.plan as SubscriptionPlan;
  if (current !== "FREE") {
    return current;
  }

  const secret = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secret) {
    return "FREE";
  }

  const stripe = new Stripe(secret, { apiVersion: "2023-10-16" });

  try {
    let subscriptionId = user.stripeSubId;

    if (!subscriptionId && user.stripeCustomerId) {
      const subs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "active",
        limit: 5,
      });
      subscriptionId = subs.data[0]?.id ?? null;
    }

    if (!subscriptionId) {
      return "FREE";
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id;
    const mapped = stripePriceToPlan(priceId);
    if (!mapped) {
      return "FREE";
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        plan: mapped,
        stripeSubId: subscriptionId,
      },
    });

    return mapped;
  } catch (err) {
    console.error("[billing] syncUserPlanFromStripe failed:", err);
    return "FREE";
  }
}
