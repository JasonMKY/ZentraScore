import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCachedScore } from "@/lib/cache";
import { computeAndPersistScore } from "@/lib/scoring/persist";
import { resolveRequestPrincipal } from "@/lib/requestAuth";
import type { SubscriptionPlan } from "@/types";

const bodySchema = z.object({
  positions: z
    .array(
      z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        borrowedUsdc: z.number().nonnegative(),
      })
    )
    .min(1)
    .max(1000),
  fresh: z.boolean().optional().default(false),
});

const API_PLANS: SubscriptionPlan[] = ["PROTOCOL", "ANALYTICS"];

function expectedDefaultRateBps(score: number): number {
  if (score >= 760) return 50;
  if (score >= 700) return 120;
  if (score >= 640) return 220;
  if (score >= 580) return 380;
  return 700;
}

export async function POST(req: NextRequest) {
  const principal = await resolveRequestPrincipal(req);
  if (!principal) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!API_PLANS.includes(principal.plan)) {
    return NextResponse.json(
      {
        error: "plan_required",
        message: "Portfolio analytics requires Protocol API or Risk Analytics plan.",
      },
      { status: 403 }
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "Invalid analytics payload." },
      { status: 400 }
    );
  }

  const scores = await Promise.all(
    body.positions.map(async (p) => {
      const cached = !body.fresh ? await getCachedScore(p.address) : null;
      const score = cached ?? (await computeAndPersistScore({ address: p.address })).result;
      return {
        address: p.address,
        borrowedUsdc: p.borrowedUsdc,
        score: score.score,
        grade: score.grade,
      };
    })
  );

  const totalExposureUsdc = scores.reduce((acc, p) => acc + p.borrowedUsdc, 0);
  const weightedAverageScore =
    totalExposureUsdc > 0
      ? Math.round(
          scores.reduce((acc, p) => acc + p.score * p.borrowedUsdc, 0) /
            totalExposureUsdc
        )
      : 0;

  const expectedLossUsdc = scores.reduce((acc, p) => {
    const defaultRate = expectedDefaultRateBps(p.score) / 10000;
    return acc + p.borrowedUsdc * defaultRate;
  }, 0);
  const expectedDefaultRateBpsValue =
    totalExposureUsdc > 0 ? Math.round((expectedLossUsdc / totalExposureUsdc) * 10000) : 0;

  return NextResponse.json({
    totalExposureUsdc: Math.round(totalExposureUsdc),
    weightedAverageScore,
    expectedDefaultRateBps: expectedDefaultRateBpsValue,
    expectedLossUsdc: Math.round(expectedLossUsdc),
    positions: scores,
  });
}

