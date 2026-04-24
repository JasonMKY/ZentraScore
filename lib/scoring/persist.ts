import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCachedScore, setCachedScore } from "@/lib/cache";
import { fetchWalletData } from "@/lib/scoring/fetcher";
import { meetsHardGates, runScoringPipeline } from "@/lib/scoring/engine";
import { generateAlertsForScoreRun } from "@/lib/alerts/generate";
import type { ScoreResult, WalletRawData } from "@/types";

export interface PersistedScoreRun {
  result: Omit<ScoreResult, "fromCache">;
  previousScore: number | undefined;
  previousEligibleProtocols: string[];
  rawData: WalletRawData;
}

export interface PersistOptions {
  /** 0x address, any case */
  address: string;
  /** Chains to include in the score (merged). Omit to use the full default set (Ethereum, Arbitrum, Base, Avalanche, Unichain). */
  chains?: string[];
  /** Persist a ScoreHistory row + alerts when wallet/user are available */
  walletUserContext?: { walletId: string; userId: string };
  /** Label stored on ScoreHistory.keyEvent for this run */
  keyEvent?: string | null;
}

/**
 * Full score pipeline with persistence.
 * - Fetches raw data (Alchemy/Covalent)
 * - Runs hard gates + scoring engine
 * - Writes ScoreCache (Redis)
 * - If walletUserContext provided: writes ScoreHistory and generates alerts
 * Throws if the wallet fails hard gates.
 */
export async function computeAndPersistScore(
  opts: PersistOptions
): Promise<PersistedScoreRun> {
  const address = opts.address.toLowerCase();

  const rawData = await fetchWalletData(address, opts.chains);

  const gates = meetsHardGates(rawData);
  if (!gates.passes) {
    const msg =
      gates.reason === "no_on_chain_activity"
        ? "No on-chain activity found for this address on the selected network (no ETH, tokens, transfers, or DeFi positions we can read)."
        : gates.reason ?? "Wallet cannot be scored.";
    const err = new Error(msg);
    (err as Error & { code?: string }).code = "INELIGIBLE";
    throw err;
  }

  const previousCached = await getCachedScore(address);
  const previousEligibleProtocols =
    previousCached?.loanTerms?.eligibleProtocols ?? [];

  const result = runScoringPipeline(rawData);
  await setCachedScore(address, result);

  let previousScore: number | undefined;

  if (opts.walletUserContext) {
    const { walletId, userId } = opts.walletUserContext;

    const lastEntry = await db.scoreHistory.findFirst({
      where: { walletId },
      orderBy: { recordedAt: "desc" },
      select: { score: true },
    });
    previousScore = lastEntry?.score ?? undefined;

    const delta =
      previousScore != null ? result.score - previousScore : null;

    await db.scoreHistory.create({
      data: {
        walletId,
        score: result.score,
        grade: result.grade,
        delta,
        keyEvent:
          opts.keyEvent ??
          (previousScore == null ? "first_score" : null),
        factors: result.factors as unknown as Prisma.InputJsonValue,
      },
    });

    await generateAlertsForScoreRun({
      userId,
      walletAddress: address,
      result,
      previousScore,
      previousEligibleProtocols,
      rawData,
    }).catch((err) => {
      console.error("[persist] alert generation failed:", err);
    });
  }

  return { result, previousScore, previousEligibleProtocols, rawData };
}
