import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { syncUserPlanFromStripe } from "@/lib/billing/syncUserPlanFromStripe";
import type { SubscriptionPlan } from "@/types";

export const dynamic = "force-dynamic";

/**
 * Lightweight "who am I" endpoint for the Nav / client components.
 * Returns the user's display name and effective subscription plan.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      stripeSubId: true,
      stripeCustomerId: true,
    },
  });

  let plan: SubscriptionPlan = (dbUser?.plan as SubscriptionPlan) ?? "FREE";
  if (dbUser) {
    plan = await syncUserPlanFromStripe({
      id: dbUser.id,
      plan: dbUser.plan,
      stripeSubId: dbUser.stripeSubId,
      stripeCustomerId: dbUser.stripeCustomerId,
    });
  }

  const name =
    dbUser?.name ??
    clerkUser?.firstName ??
    clerkUser?.fullName ??
    clerkUser?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "User";

  return NextResponse.json({
    authenticated: true,
    name,
    plan,
  });
}
