import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { ScoreResult, WalletRawData } from "@/types";

const PROTOCOL_LABELS: Record<string, string> = {
  "aave-v3": "Aave V3",
  "compound-v3": "Compound III",
  "maker": "MakerDAO",
  "clearpool": "Clearpool",
  "truefi": "TrueFi",
  "maple-finance": "Maple Finance",
};

function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export interface AlertRunInput {
  userId: string;
  walletAddress: string;
  result: Omit<ScoreResult, "fromCache">;
  previousScore?: number;
  previousEligibleProtocols: string[];
  rawData: WalletRawData;
}

/**
 * Creates user-facing Alert rows based on a single scoring run.
 * Reads AlertPrefs; silently skips categories the user disabled.
 * Safe to call with partial data — failures are swallowed upstream.
 */
export async function generateAlertsForScoreRun(input: AlertRunInput) {
  const prefs = await db.alertPrefs.findUnique({
    where: { userId: input.userId },
  });
  // If the user has never had prefs initialised, use defaults.
  const scoreChangeEnabled = prefs?.scoreChangeEnabled ?? true;
  const scoreChangeDelta = prefs?.scoreChangeDelta ?? 20;
  const liquidationEnabled = prefs?.liquidationEnabled ?? true;
  const liquidationHF = prefs?.liquidationHF ?? 1.3;
  const newEligibilityEnabled = prefs?.newEligibility ?? true;

  const addressShort = truncateAddress(input.walletAddress);
  const toCreate: Prisma.AlertCreateManyInput[] = [];

  // ── SCORE_CHANGE ─────────────────────────────────────────────────────────
  if (
    scoreChangeEnabled &&
    input.previousScore != null &&
    Math.abs(input.result.score - input.previousScore) >= scoreChangeDelta
  ) {
    const delta = input.result.score - input.previousScore;
    const direction = delta > 0 ? "increased" : "decreased";
    toCreate.push({
      userId: input.userId,
      type: "SCORE_CHANGE",
      title: `Score ${direction} by ${Math.abs(delta)} points`,
      message: `${addressShort} moved from ${input.previousScore} to ${input.result.score}.`,
      data: {
        address: input.walletAddress,
        previousScore: input.previousScore,
        nextScore: input.result.score,
        delta,
      } as Prisma.InputJsonValue,
    });
  }

  // ── LIQUIDATION_RISK ─────────────────────────────────────────────────────
  if (liquidationEnabled) {
    const riskyPositions = input.rawData.defiPositions
      .flatMap((p) =>
        (p.items ?? []).map((i) => ({
          protocol: p.protocol_name,
          hf: i.health_factor ?? null,
          asset: i.type,
        }))
      )
      .filter(
        (i) => i.hf != null && Number.isFinite(i.hf) && (i.hf as number) < liquidationHF
      );

    if (riskyPositions.length > 0) {
      const worst = riskyPositions.reduce((a, b) =>
        (a.hf ?? 99) < (b.hf ?? 99) ? a : b
      );
      toCreate.push({
        userId: input.userId,
        type: "LIQUIDATION_RISK",
        title: `Liquidation risk on ${worst.protocol}`,
        message: `Health factor ${worst.hf!.toFixed(2)} on ${addressShort}. Add collateral or repay to avoid liquidation.`,
        data: {
          address: input.walletAddress,
          protocol: worst.protocol,
          healthFactor: worst.hf,
          threshold: liquidationHF,
        } as Prisma.InputJsonValue,
      });
    }
  }

  // ── NEW_ELIGIBILITY ──────────────────────────────────────────────────────
  if (newEligibilityEnabled) {
    const previous = new Set(input.previousEligibleProtocols);
    const gained = input.result.loanTerms.eligibleProtocols.filter(
      (slug) => !previous.has(slug)
    );
    // Only fire if we have a previous run to compare to — avoid spamming on first score.
    if (previous.size > 0 && gained.length > 0) {
      for (const slug of gained) {
        toCreate.push({
          userId: input.userId,
          type: "NEW_ELIGIBILITY",
          title: `Eligible for ${PROTOCOL_LABELS[slug] ?? slug}`,
          message: `${addressShort} now qualifies for loans on ${PROTOCOL_LABELS[slug] ?? slug}.`,
          data: {
            address: input.walletAddress,
            protocol: slug,
          } as Prisma.InputJsonValue,
        });
      }
    }
  }

  if (toCreate.length === 0) return { created: 0 };

  const created = await db.alert.createMany({
    data: toCreate,
    skipDuplicates: true,
  });
  return { created: created.count };
}
