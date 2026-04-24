// app/dashboard/page.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCachedScore } from "@/lib/cache";
import { computeLoanTerms } from "@/lib/scoring/engine";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type {
  ScoreFactors,
  ScoreGrade,
  ScoreHistoryPoint,
  ScoreResult,
  SubscriptionPlan,
} from "@/types";
import { syncUserPlanFromStripe } from "@/lib/billing/syncUserPlanFromStripe";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string; plan?: string };
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();

  // Get user from DB (created by Clerk webhook on signup)
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      wallets: { orderBy: { addedAt: "asc" } },
      alerts: {
        where: { read: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      alertPrefs: true,
    },
  });

  // Auto-create user if webhook hasn't fired yet (race condition safety)
  if (!user) {
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress ?? `${userId}@unknown.com`;
    user = await db.user.create({
      data: {
        clerkId: userId,
        email,
        name: clerkUser?.fullName ?? null,
        alertPrefs: { create: {} },
      },
      include: {
        wallets: { orderBy: { addedAt: "asc" } },
        alerts: { where: { read: false }, orderBy: { createdAt: "desc" }, take: 10 },
        alertPrefs: true,
      },
    });
  }

  const primaryWallet = user.wallets.find((w) => w.isPrimary) ?? user.wallets[0];

  // Run independent fetches in parallel. Stripe sync is gated to FREE users
  // in syncUserPlanFromStripe itself (paid users short-circuit instantly).
  const [effectivePlan, scoreData, historyRows] = await Promise.all([
    syncUserPlanFromStripe({
      id: user.id,
      plan: user.plan,
      stripeSubId: user.stripeSubId,
      stripeCustomerId: user.stripeCustomerId,
    }) as Promise<SubscriptionPlan>,
    primaryWallet ? getCachedScore(primaryWallet.address) : Promise.resolve(null),
    primaryWallet
      ? db.scoreHistory.findMany({
          where: { walletId: primaryWallet.id },
          orderBy: { recordedAt: "desc" },
          take: 12,
        })
      : Promise.resolve([]),
  ]);

  const scoreHistory: ScoreHistoryPoint[] = historyRows.map((h) => ({
    score: h.score,
    grade: h.grade as ScoreGrade,
    delta: h.delta,
    keyEvent: h.keyEvent,
    recordedAt: h.recordedAt.toISOString(),
  }));

  // Fallback: when Redis is unavailable (or the cache has expired), fabricate
  // a ScoreResult from the most recent ScoreHistory row so the dashboard shows
  // real data immediately instead of sitting on "Computing…".
  const resolvedScore: ScoreResult | null =
    scoreData ??
    (primaryWallet && historyRows[0]
      ? ((): ScoreResult => {
          const h = historyRows[0];
          const factors = (h.factors ?? {}) as unknown as ScoreFactors;
          return {
            address: primaryWallet.address,
            score: h.score,
            grade: h.grade as ScoreGrade,
            valid: true,
            factors,
            loanTerms: computeLoanTerms(h.score),
            fraudFlags: [],
            computedAt: h.recordedAt.toISOString(),
            expiresAt: new Date(
              h.recordedAt.getTime() + 60 * 60 * 1000
            ).toISOString(),
            fromCache: true,
          };
        })()
      : null);

  // Serialize user for client component (Dates → strings)
  const serializedUser = {
    id: user.id,
    email: user.email,
    name: user.name ?? clerkUser?.firstName ?? "User",
    plan: effectivePlan,
    wallets: user.wallets.map((w) => ({
      id: w.id,
      address: w.address,
      chain: w.chain,
      isPrimary: w.isPrimary,
      label: w.label,
    })),
    unreadAlerts: user.alerts.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      message: a.message,
      createdAt: a.createdAt.toISOString(),
    })),
    alertPrefs: user.alertPrefs,
  };

  return (
    <DashboardClient
      user={serializedUser}
      initialScore={resolvedScore}
      scoreHistory={scoreHistory}
      justUpgraded={searchParams.upgraded === "true"}
      upgradedPlan={searchParams.plan}
    />
  );
}
