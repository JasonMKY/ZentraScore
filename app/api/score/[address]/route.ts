import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCachedScore, checkRateLimit } from "@/lib/cache";
import { computeAndPersistScore } from "@/lib/scoring/persist";
import { dispatchScoreUpdate } from "@/lib/webhooks/dispatcher";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/types";
import type { SubscriptionPlan } from "@/types";
import { resolveRequestPrincipal } from "@/lib/requestAuth";

const paramsSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

const querySchema = z.object({
  fresh: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  chains: z
    .string()
    .optional()
    .transform((v) => {
      if (!v?.trim()) return undefined;
      return v.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    }),
  include_history: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const addressParse = paramsSchema.safeParse(params);
  if (!addressParse.success) {
    return NextResponse.json(
      { error: "invalid_address", message: "Provide a valid 0x Ethereum address" },
      { status: 400 }
    );
  }
  const { address } = addressParse.data;

  const url = new URL(req.url);
  const queryParse = querySchema.safeParse({
    fresh: url.searchParams.get("fresh"),
    chains: url.searchParams.get("chains"),
    include_history: url.searchParams.get("include_history"),
  });
  const { fresh, chains: chainsParam, include_history } = queryParse.success
    ? queryParse.data
    : {
        fresh: false,
        chains: undefined as string[] | undefined,
        include_history: false,
      };

  const principal = await resolveRequestPrincipal(req);
  let plan: SubscriptionPlan = "FREE";
  let dbUser: { id: string; plan: string } | null = null;

  if (principal) {
    plan = principal.plan as SubscriptionPlan;
    dbUser = await db.user.findUnique({
      where: { id: principal.userId },
      select: { id: true, plan: true },
    });
  }

  const limits = PLAN_LIMITS[plan];
  const rateLimitKey = principal
    ? `${principal.source}:${principal.userId}`
    : req.ip ?? "anonymous";
  const rateLimit = await checkRateLimit(rateLimitKey, limits.requestsPerMin);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Too many requests. Upgrade your plan for higher limits.",
        resetAt: rateLimit.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limits.requestsPerMin),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  if (!fresh) {
    const cached = await getCachedScore(address);
    if (cached) {
      const response: Record<string, unknown> = { ...cached };
      if (include_history) {
        response.history = await loadAddressHistory(address, 12);
      }
      return NextResponse.json(response, {
        headers: {
          "X-Score-Source": "cache",
          "Cache-Control": "public, s-maxage=3600",
        },
      });
    }
  }

  let wallet: { id: string } | null = null;
  if (dbUser) {
    wallet = await db.wallet.findFirst({
      where: { address: address.toLowerCase(), userId: dbUser.id },
      select: { id: true },
    });
  }

  try {
    const persistResult = await computeAndPersistScore({
      address,
      chains: chainsParam,
      walletUserContext:
        wallet && dbUser
          ? { walletId: wallet.id, userId: dbUser.id }
          : undefined,
      keyEvent: fresh ? "manual_refresh" : null,
    });

    const { result, previousScore } = persistResult;

    if (wallet) {
      dispatchScoreUpdate(
        address,
        { ...result, fromCache: false },
        previousScore
      ).catch((err) =>
        console.error("[score-api] webhook dispatch failed:", err)
      );
    }

    const response: Record<string, unknown> = {
      ...result,
      fromCache: false,
    };
    if (include_history) {
      response.history = await loadAddressHistory(address, 12);
    }
    return NextResponse.json(
      response,
      {
        headers: {
          "X-Score-Source": "computed",
          "Cache-Control": "public, s-maxage=3600",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err) {
    const code = (err as Error & { code?: string }).code;
    if (code === "INELIGIBLE") {
      return NextResponse.json(
        {
          error: "ineligible",
          message: (err as Error).message,
          reason: (err as Error).message,
          valid: false,
          address,
        },
        { status: 404 }
      );
    }
    if (code === "PROVIDER_ERROR") {
      console.error("[score-api] provider error:", (err as Error).message);
      return NextResponse.json(
        {
          error: "provider_error",
          message: (err as Error).message,
          address,
        },
        { status: 502 }
      );
    }
    console.error("[score-api] compute failed:", err);
    return NextResponse.json(
      { error: "data_fetch_failed", message: "Failed to fetch on-chain data. Try again." },
      { status: 503 }
    );
  }
}

async function loadAddressHistory(address: string, months: number) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const history = await db.scoreHistory.findMany({
    where: {
      wallet: { address: address.toLowerCase() },
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "asc" },
  });

  return history.map((record, i) => ({
    score: record.score,
    grade: record.grade,
    factors: record.factors,
    keyEvent: record.keyEvent,
    delta: i > 0 ? record.score - history[i - 1].score : null,
    recordedAt: record.recordedAt.toISOString(),
  }));
}
