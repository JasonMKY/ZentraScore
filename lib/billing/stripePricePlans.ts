import type { SubscriptionPlan } from "@/types";

/** Map a Stripe Price ID to our subscription plan (test/live IDs from env). */
export function stripePriceToPlan(priceId: string | undefined): SubscriptionPlan | null {
  if (!priceId) return null;
  const consumer = process.env.STRIPE_PRICE_CONSUMER;
  const protocol = process.env.STRIPE_PRICE_PROTOCOL;
  const analytics = process.env.STRIPE_PRICE_ANALYTICS;
  if (!consumer?.trim() || !protocol?.trim() || !analytics?.trim()) return null;

  const map: Record<string, SubscriptionPlan> = {
    [consumer]: "CONSUMER",
    [protocol]: "PROTOCOL",
    [analytics]: "ANALYTICS",
  };
  return map[priceId] ?? null;
}
