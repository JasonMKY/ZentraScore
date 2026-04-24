/**
 * Alchemy uses one app API key; optional per-chain vars only override that key.
 * Empty lines in .env (ALCHEMY_ARBITRUM_KEY=) are treated as "use primary key".
 */

export function getPrimaryAlchemyApiKey(): string {
  const k = process.env.ALCHEMY_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "ALCHEMY_API_KEY is missing. Add your Alchemy app key to .env.local — the same key works for Ethereum, Arbitrum, Base, Avalanche, and Unichain if you enable those networks on that app (https://dashboard.alchemy.com)."
    );
  }
  return k;
}

const SUPPORTED_CHAINS = [
  "ethereum",
  "arbitrum",
  "base",
  "avalanche",
  "unichain",
] as const;
type SupportedChain = (typeof SUPPORTED_CHAINS)[number];

function isSupported(c: string): c is SupportedChain {
  return (SUPPORTED_CHAINS as readonly string[]).includes(c);
}

export function alchemyApiKeyForChain(chain: string): string {
  const primary = getPrimaryAlchemyApiKey();
  const c = chain.toLowerCase();
  if (c === "arbitrum") {
    return process.env.ALCHEMY_ARBITRUM_KEY?.trim() || primary;
  }
  if (c === "base") {
    return process.env.ALCHEMY_BASE_KEY?.trim() || primary;
  }
  if (c === "avalanche") {
    return process.env.ALCHEMY_AVALANCHE_KEY?.trim() || primary;
  }
  if (c === "unichain") {
    return process.env.ALCHEMY_UNICHAIN_KEY?.trim() || primary;
  }
  return primary;
}

/**
 * Which chain Alchemy reads for tokens/transfers/balance.
 * Set ALCHEMY_SCORE_CHAIN=ethereum if your Alchemy app only has Ethereum enabled
 * but users pick one of the other supported chains in the UI.
 */
export function resolveAlchemyDataChain(walletChain: string): string {
  const o = process.env.ALCHEMY_SCORE_CHAIN?.trim().toLowerCase();
  if (o && isSupported(o)) return o;
  const w = (walletChain || "ethereum").toLowerCase();
  if (isSupported(w)) return w;
  return "ethereum";
}
