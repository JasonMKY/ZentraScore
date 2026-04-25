import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCachedScore, setCachedScore, checkRateLimit } from "@/lib/cache";
import { fetchWalletData } from "@/lib/scoring/fetcher";
import { meetsHardGates, runScoringPipeline } from "@/lib/scoring/engine";
import { PLAN_LIMITS } from "@/types";
import type { SubscriptionPlan } from "@/types";
import { resolveRequestPrincipal } from "@/lib/requestAuth";

const bodySchema = z.object({
  addresses: z
    .array(z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .min(1)
    .max(500),
  fresh: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const principal = await resolveRequestPrincipal(req);
  if (!principal) {
    return NextResponse.json(
      { error: "unauthorized", message: "API key required for batch scoring" },
      { status: 401 }
    );
  }
  const plan = principal.plan as SubscriptionPlan;
  const limits = PLAN_LIMITS[plan];

  if (limits.batchSize === 0) {
    return NextResponse.json(
      {
        error: "plan_limit",
        message: "Batch scoring requires Protocol or Analytics plan.",
      },
      { status: 403 }
    );
  }

  // Per-user rate limit for batch endpoint (3× single-score limit)
  const rateLimit = await checkRateLimit(
    `batch:${principal.source}:${principal.userId}`,
    Math.max(limits.requestsPerMin * 3, 10)
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Batch rate limit reached.", resetAt: rateLimit.resetAt },
      { status: 429 }
    );
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid request body" },
      { status: 400 }
    );
  }

  if (body.addresses.length > limits.batchSize) {
    return NextResponse.json(
      {
        error: "batch_too_large",
        message: `Your plan allows up to ${limits.batchSize} addresses per batch.`,
      },
      { status: 400 }
    );
  }

  const CONCURRENCY = 10;
  const results: Array<ReturnType<typeof runScoringPipeline> | null> = new Array(
    body.addresses.length
  ).fill(null);

  let cached = 0;
  let computed = 0;
  let failed = 0;

  for (let i = 0; i < body.addresses.length; i += CONCURRENCY) {
    const chunk = body.addresses.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (address, chunkIdx) => {
        const idx = i + chunkIdx;
        try {
          if (!body.fresh) {
            const hit = await getCachedScore(address);
            if (hit) {
              results[idx] = hit;
              cached++;
              return;
            }
          }

          const rawData = await fetchWalletData(address);
          const gates = meetsHardGates(rawData);
          if (!gates.passes) {
            results[idx] = null;
            return;
          }

          const result = runScoringPipeline(rawData);
          await setCachedScore(address, result);
          results[idx] = result;
          computed++;
        } catch {
          results[idx] = null;
          failed++;
        }
      })
    );
  }

  return NextResponse.json({
    results,
    computed,
    cached,
    failed,
    total: body.addresses.length,
  });
}
