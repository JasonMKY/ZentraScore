import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCachedScore } from "@/lib/cache";
import { computeAndPersistScore } from "@/lib/scoring/persist";
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
});

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  const principal = await resolveRequestPrincipal(req);
  if (!principal) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const addressParse = paramsSchema.safeParse(params);
  if (!addressParse.success) {
    return NextResponse.json(
      { error: "invalid_address", message: "Provide a valid 0x Ethereum address" },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const query = querySchema.safeParse({ fresh: url.searchParams.get("fresh") });
  const fresh = query.success ? query.data.fresh : false;
  const address = addressParse.data.address;

  const cached = !fresh ? await getCachedScore(address) : null;
  const score = cached ?? (await computeAndPersistScore({ address })).result;

  if (!score) {
    return NextResponse.json(
      { error: "not_found", message: "No score available for this address." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    maxLtvBps: score.loanTerms.maxLtvBps,
    interestRateBps: score.loanTerms.interestRateBps,
    maxBorrowUsdc: score.loanTerms.maxBorrowUsdc,
    scoreBand: score.grade,
    eligibleProtocols: score.loanTerms.eligibleProtocols,
    score: score.score,
    address: score.address,
  });
}

