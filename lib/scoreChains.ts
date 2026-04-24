/** Chains we pull on-chain data from for a unified EOA score. */
export const DEFAULT_SCORE_CHAINS = [
  "ethereum",
  "arbitrum",
  "base",
  "avalanche",
  "unichain",
] as const;

const ALLOWED = new Set<string>(DEFAULT_SCORE_CHAINS);

/**
 * Chains used when computing a score for an address.
 * - If `ALCHEMY_SCORE_CHAINS` is set (comma-separated), that list wins.
 * - Else if the caller passes a non-empty list, those chains are used (must be allowed).
 * - Else all default chains (Ethereum + Arbitrum + Base + Avalanche + Unichain) are used.
 */
export function normalizeScoreChains(requested?: string[]): string[] {
  const fromEnv =
    process.env.ALCHEMY_SCORE_CHAINS?.split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean) ?? [];
  if (fromEnv.length > 0) {
    const u = [...new Set(fromEnv.filter((c) => ALLOWED.has(c)))];
    if (u.length > 0) return u;
  }
  const req = requested?.map((c) => c.toLowerCase()).filter(Boolean) ?? [];
  if (req.length === 0) return [...DEFAULT_SCORE_CHAINS];
  const u = [...new Set(req.filter((c) => ALLOWED.has(c)))];
  return u.length > 0 ? u : [...DEFAULT_SCORE_CHAINS];
}
