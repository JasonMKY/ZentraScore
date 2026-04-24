// lib/scoring/fetcher.ts
// Fetches raw on-chain data from Alchemy and Covalent, normalises it.
//
// NOTE: we call Alchemy over plain JSON-RPC via native `fetch` instead of
// going through the `alchemy-sdk` HTTP layer. The SDK uses @ethersproject/web,
// which conflicts with Next.js's patched global fetch on the server and
// produces spurious `SERVER_ERROR / missing response` errors even when the
// key and network are healthy.

import type {
  WalletRawData,
  CovalentDefiItem,
  CovalentDefiResponse,
  AlchemyTokenBalance,
} from "@/types";
import {
  alchemyApiKeyForChain,
  getPrimaryAlchemyApiKey,
  resolveAlchemyDataChain,
} from "@/lib/alchemyEnv";
import { normalizeScoreChains } from "@/lib/scoreChains";
import { meetsHardGates } from "@/lib/scoring/engine";

// ─── Alchemy JSON-RPC transport ──────────────────────────────────────────────
const ALCHEMY_HOST: Record<string, string> = {
  ethereum: "eth-mainnet.g.alchemy.com",
  arbitrum: "arb-mainnet.g.alchemy.com",
  base: "base-mainnet.g.alchemy.com",
  avalanche: "avax-mainnet.g.alchemy.com",
  unichain: "unichain-mainnet.g.alchemy.com",
};

function alchemyRpcUrl(chain: string): string {
  const c = chain.toLowerCase();
  const host = ALCHEMY_HOST[c] ?? ALCHEMY_HOST.ethereum;
  const key = alchemyApiKeyForChain(c);
  return `https://${host}/v2/${key}`;
}

let rpcIdCounter = 1;

async function alchemyRpc<T>(
  chain: string,
  method: string,
  params: unknown[]
): Promise<T> {
  const url = alchemyRpcUrl(chain);
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: rpcIdCounter++,
    method,
    params,
  });

  // AbortController gives us a hard timeout the ethers layer doesn't.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body,
      signal: ctrl.signal,
      // Important: opt OUT of Next's fetch cache; these are user-scoped calls.
      cache: "no-store",
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Alchemy ${method} on ${chain} returned HTTP ${res.status} ${res.statusText}${
        text ? `: ${text.slice(0, 200)}` : ""
      }`
    );
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }

  const json = (await res.json()) as {
    result?: T;
    error?: { code?: number; message?: string };
  };
  if (json.error) {
    const err = new Error(
      `Alchemy ${method} on ${chain} RPC error ${
        json.error.code ?? "?"
      }: ${json.error.message ?? "unknown"}`
    );
    (err as Error & { rpcCode?: number }).rpcCode = json.error.code;
    throw err;
  }
  return json.result as T;
}

function dedupeMultiChainTokens(balances: AlchemyTokenBalance[]): AlchemyTokenBalance[] {
  const m = new Map<string, AlchemyTokenBalance>();
  for (const x of balances) {
    const ch = (x.sourceChain ?? "").toLowerCase();
    const k = `${ch}:${x.contractAddress.toLowerCase()}`;
    if (!m.has(k)) m.set(k, x);
  }
  return Array.from(m.values());
}

type FetchOutcome<T> = { ok: true; data: T } | { ok: false; error: string };

function describeErr(err: unknown): string {
  if (err && typeof err === "object") {
    const e = err as { message?: string; status?: number; code?: string };
    if (e.status) return `${e.status} ${e.message ?? ""}`.trim();
    if (e.message) return e.message;
  }
  return String(err);
}

/** Transient Alchemy/ethers errors we should retry (no auth issue). */
function isTransientAlchemyError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; status?: number; message?: string };
  if (e.status && e.status >= 500) return true;
  if (e.status === 429) return true;
  const code = String(e.code ?? "").toUpperCase();
  if (code === "SERVER_ERROR" || code === "TIMEOUT" || code === "NETWORK_ERROR") {
    return true;
  }
  const msg = String(e.message ?? "");
  return (
    /missing response|timeout|ETIMEDOUT|ECONNRESET|ENOTFOUND|fetch failed/i.test(msg)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Retry an async Alchemy call on transient errors with exponential backoff +
 * small jitter. Keeps auth/validation failures as immediate errors.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 3
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === maxAttempts || !isTransientAlchemyError(err)) {
        throw err;
      }
      const backoff = 250 * 2 ** (attempt - 1) + Math.floor(Math.random() * 150);
      console.warn(
        `[fetcher] ${label} transient error (attempt ${attempt}/${maxAttempts}), retrying in ${backoff}ms:`,
        describeErr(err)
      );
      await sleep(backoff);
    }
  }
  throw lastErr;
}

// ─── Fetch token balances ─────────────────────────────────────────────────────
interface RpcTokenBalance {
  contractAddress: string;
  tokenBalance: string | null;
  error?: string | null;
}

async function fetchTokenBalances(
  address: string,
  chain = "ethereum"
): Promise<FetchOutcome<AlchemyTokenBalance[]>> {
  try {
    const result = await withRetry(
      () =>
        alchemyRpc<{ address: string; tokenBalances: RpcTokenBalance[] }>(
          chain,
          "alchemy_getTokenBalances",
          [address, "erc20"]
        ),
      `tokenBalances[${chain}]`
    );
    const balances: AlchemyTokenBalance[] = (result?.tokenBalances ?? []).map(
      (b) => ({
        contractAddress: b.contractAddress,
        tokenBalance: b.tokenBalance,
      })
    );
    return { ok: true, data: balances };
  } catch (err) {
    const msg = describeErr(err);
    console.error(`[fetcher] tokenBalances failed for ${address} on ${chain}:`, msg);
    return { ok: false, error: msg };
  }
}

// ─── Fetch transfer history ───────────────────────────────────────────────────
// Alchemy only supports the `internal` category on Ethereum and Polygon.
// Arbitrum and Base reject it with -32602.
function transferCategoriesFor(chain: string): string[] {
  const c = chain.toLowerCase();
  if (c === "ethereum" || c === "polygon") {
    return ["external", "erc20", "internal"];
  }
  return ["external", "erc20"];
}

interface AlchemyTransferLike {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  metadata?: { blockTimestamp?: string };
}

type TransfersDirection = "from" | "to";

async function rpcGetAssetTransfers(
  chain: string,
  address: string,
  dir: TransfersDirection,
  opts: { maxCount: number; order?: "asc" | "desc"; withMetadata?: boolean }
): Promise<AlchemyTransferLike[]> {
  const params: Record<string, unknown> = {
    category: transferCategoriesFor(chain),
    maxCount: "0x" + opts.maxCount.toString(16),
    withMetadata: opts.withMetadata ?? true,
  };
  if (dir === "to") params.toAddress = address;
  else params.fromAddress = address;
  if (opts.order) params.order = opts.order;

  const res = await alchemyRpc<{ transfers: AlchemyTransferLike[] }>(
    chain,
    "alchemy_getAssetTransfers",
    [params]
  );
  return res?.transfers ?? [];
}

async function fetchTransferHistory(
  address: string,
  chain = "ethereum"
): Promise<FetchOutcome<AlchemyTransferLike[]>> {
  try {
    // Sequential instead of Promise.all to halve peak concurrency per chain.
    const inbound = await withRetry(
      () => rpcGetAssetTransfers(chain, address, "to", { maxCount: 200 }),
      `transfersIn[${chain}]`
    );
    const outbound = await withRetry(
      () => rpcGetAssetTransfers(chain, address, "from", { maxCount: 200 }),
      `transfersOut[${chain}]`
    );
    return { ok: true, data: [...inbound, ...outbound] };
  } catch (err) {
    const msg = describeErr(err);
    console.error(`[fetcher] transferHistory failed for ${address} on ${chain}:`, msg);
    return { ok: false, error: msg };
  }
}

/**
 * Oldest transfer timestamp — avoids missing history when only recent 200 txs are loaded.
 * Only called when the transfer history doesn't already cover the oldest tx.
 */
async function fetchEarliestTransferDate(
  address: string,
  chain = "ethereum"
): Promise<FetchOutcome<Date | null>> {
  try {
    const fromFirst = await withRetry(
      () =>
        rpcGetAssetTransfers(chain, address, "from", {
          maxCount: 1,
          order: "asc",
        }),
      `earliestFrom[${chain}]`
    );
    const toFirst = await withRetry(
      () =>
        rpcGetAssetTransfers(chain, address, "to", {
          maxCount: 1,
          order: "asc",
        }),
      `earliestTo[${chain}]`
    );
    const times: number[] = [];
    for (const t of [...fromFirst, ...toFirst]) {
      const ts = t.metadata?.blockTimestamp;
      if (ts) times.push(new Date(ts).getTime());
    }
    return {
      ok: true,
      data: times.length === 0 ? null : new Date(Math.min(...times)),
    };
  } catch (err) {
    const msg = describeErr(err);
    console.error(
      `[fetcher] fetchEarliestTransferDate failed for ${address} on ${chain}:`,
      msg
    );
    return { ok: false, error: msg };
  }
}

async function fetchHasNativeBalance(
  address: string,
  chain = "ethereum"
): Promise<FetchOutcome<boolean>> {
  try {
    const hex = await withRetry(
      () => alchemyRpc<string>(chain, "eth_getBalance", [address, "latest"]),
      `getBalance[${chain}]`
    );
    const positive = BigInt(hex ?? "0x0") > BigInt(0);
    return { ok: true, data: positive };
  } catch (err) {
    const msg = describeErr(err);
    console.error(`[fetcher] getBalance failed for ${address} on ${chain}:`, msg);
    return { ok: false, error: msg };
  }
}

function earliestOf(dates: (Date | null)[]): Date | null {
  const valid = dates.filter(
    (d): d is Date => d != null && !isNaN(d.getTime())
  );
  if (valid.length === 0) return null;
  return new Date(Math.min(...valid.map((d) => d.getTime())));
}

// ─── Find wallet's first transaction date ─────────────────────────────────────
function extractFirstTxDate(transfers: AlchemyTransferLike[]): Date | null {
  if (transfers.length === 0) return null;

  const timestamps = transfers
    .map((t) => t.metadata?.blockTimestamp)
    .filter((x): x is string => Boolean(x))
    .map((ts) => new Date(ts).getTime())
    .filter((t) => !isNaN(t));

  if (timestamps.length === 0) return null;
  return new Date(Math.min(...timestamps));
}

// ─── Covalent: DeFi protocol positions ────────────────────────────────────────
// Uses Covalent's per-protocol "stacks" balances endpoints (Aave V3, Compound III).
// portfolio_v2 returns token holdings, NOT DeFi positions — do not use it here.

const COVALENT_CHAIN: Record<string, string> = {
  ethereum: "eth-mainnet",
  arbitrum: "arbitrum-mainnet",
  base: "base-mainnet",
  avalanche: "avalanche-mainnet",
  // Unichain: Covalent DeFi stacks are not yet available — skip DeFi lookup.
};

const DEFI_STACKS = ["aave_v3", "compound_v3"] as const;
type DefiStack = (typeof DEFI_STACKS)[number];

// 60s in-memory cache keyed on `${address}:${chain}` to keep Covalent usage low.
type PositionsCacheEntry = { at: number; data: CovalentDefiItem[] };
const positionsCache = new Map<string, PositionsCacheEntry>();
const POSITIONS_TTL_MS = 60_000;

async function fetchStack(
  address: string,
  chainName: string,
  stack: DefiStack,
  apiKey: string
): Promise<CovalentDefiItem[]> {
  const url = `https://api.covalenthq.com/v1/${chainName}/address/${address}/stacks/${stack}/balances/`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`[fetcher] Covalent ${stack} ${res.status} for ${address}`);
      }
      return [];
    }
    const json: CovalentDefiResponse = await res.json();
    if (json.error || !json.data?.items) return [];
    return json.data.items;
  } catch (err) {
    console.error(`[fetcher] Covalent ${stack} fetch failed:`, err);
    return [];
  }
}

export async function fetchDefiPositions(
  address: string,
  chain = "ethereum"
): Promise<CovalentDefiItem[]> {
  const apiKey = process.env.COVALENT_API_KEY;
  if (!apiKey) {
    console.warn("[fetcher] COVALENT_API_KEY not set, skipping DeFi fetch");
    return [];
  }

  const chainName = COVALENT_CHAIN[chain] ?? "eth-mainnet";
  const cacheKey = `${address.toLowerCase()}:${chainName}`;
  const now = Date.now();
  const cached = positionsCache.get(cacheKey);
  if (cached && now - cached.at < POSITIONS_TTL_MS) {
    return cached.data;
  }

  const results = await Promise.all(
    DEFI_STACKS.map((s) => fetchStack(address, chainName, s, apiKey))
  );
  const merged = results.flat();

  positionsCache.set(cacheKey, { at: now, data: merged });
  return merged;
}

type RawAlchemyTransfer = AlchemyTransferLike;

interface ChainBundle {
  chain: string;
  tokenBalances: AlchemyTokenBalance[];
  rawTransfers: RawAlchemyTransfer[];
  defiPositions: CovalentDefiItem[];
  earliestTxDate: Date | null;
  hasEthBalance: boolean;
  /** True if at least one Alchemy call succeeded for this chain. */
  alchemyOk: boolean;
  /** Errors from Alchemy calls (useful when all fail). */
  alchemyErrors: string[];
}

async function fetchOneChainBundle(
  address: string,
  chain: string
): Promise<ChainBundle> {
  const alchemyCh = resolveAlchemyDataChain(chain);

  // Fire the 3 cheap, independent Alchemy calls in parallel; defer the
  // "earliest tx" lookup so we only pay for it when the regular history might
  // have truncated (i.e. returned the 200-tx cap).
  const [tb, tr, he, defi] = await Promise.all([
    fetchTokenBalances(address, alchemyCh),
    fetchTransferHistory(address, alchemyCh),
    fetchHasNativeBalance(address, alchemyCh),
    fetchDefiPositions(address, chain),
  ]);

  const transferCount = tr.ok ? tr.data.length : 0;
  // Only spend extra RPCs if we might be missing early history.
  const needsEarliestLookup = transferCount >= 390; // near the 2×200 cap
  const et: FetchOutcome<Date | null> = needsEarliestLookup
    ? await fetchEarliestTransferDate(address, alchemyCh)
    : { ok: true, data: null };

  const alchemyResults: FetchOutcome<unknown>[] = [tb, tr, he, et];
  const alchemyOk = alchemyResults.some((r) => r.ok);
  const alchemyErrors = alchemyResults
    .filter((r): r is { ok: false; error: string } => !r.ok)
    .map((r) => r.error);

  return {
    chain,
    tokenBalances: (tb.ok ? tb.data : []).map((b) => ({
      ...b,
      sourceChain: chain,
    })),
    rawTransfers: tr.ok ? tr.data : [],
    defiPositions: defi.map((p) => ({ ...p, sourceChain: chain })),
    earliestTxDate: et.ok ? et.data : null,
    hasEthBalance: he.ok ? he.data : false,
    alchemyOk,
    alchemyErrors,
  };
}

function mergeBundles(bundles: ChainBundle[]): {
  tokenBalances: AlchemyTokenBalance[];
  rawTransfers: RawAlchemyTransfer[];
  defiPositions: CovalentDefiItem[];
  earliestDates: (Date | null)[];
  hasEthBalance: boolean;
} {
  return {
    tokenBalances: dedupeMultiChainTokens(
      bundles.flatMap((b) => b.tokenBalances)
    ),
    rawTransfers: bundles.flatMap((b) => b.rawTransfers),
    defiPositions: bundles.flatMap((b) => b.defiPositions),
    earliestDates: bundles.map((b) => b.earliestTxDate),
    hasEthBalance: bundles.some((b) => b.hasEthBalance),
  };
}

function toWalletRawData(
  address: string,
  merged: ReturnType<typeof mergeBundles>
): WalletRawData {
  const { tokenBalances, rawTransfers, defiPositions, earliestDates, hasEthBalance } =
    merged;
  const firstTxDate = earliestOf([
    extractFirstTxDate(rawTransfers),
    ...earliestDates,
  ]);
  const transfers = rawTransfers.map((t) => ({
    blockNum: t.blockNum,
    hash: t.hash,
    from: t.from,
    to: t.to ?? null,
    value: t.value ?? null,
    asset: t.asset ?? null,
    category: t.category,
    metadata: {
      blockTimestamp: t.metadata?.blockTimestamp ?? new Date().toISOString(),
    },
  }));
  return {
    address: address.toLowerCase(),
    tokenBalances,
    transfers,
    firstTxDate,
    defiPositions,
    hasEthBalance,
  };
}

function throwProviderError(bundles: ChainBundle[]): never {
  const details = bundles
    .map((b) => {
      const errs = b.alchemyErrors.slice(0, 1).join(" | ");
      return `${b.chain}: ${errs || "no response"}`;
    })
    .join("; ");
  const err = new Error(
    `On-chain data provider (Alchemy) is unreachable or rejected the request. Verify ALCHEMY_API_KEY and that the requested networks (Ethereum, Arbitrum, Base, Avalanche, Unichain) are enabled on your Alchemy app. Details — ${details}`
  );
  (err as Error & { code?: string }).code = "PROVIDER_ERROR";
  throw err;
}

// ─── Main: fetch all data for an address (multi-chain aggregate for scoring) ─
export async function fetchWalletData(
  address: string,
  chains?: string[]
): Promise<WalletRawData> {
  getPrimaryAlchemyApiKey();

  const scoreChainList = normalizeScoreChains(chains);
  const bundles: ChainBundle[] = await Promise.all(
    scoreChainList.map((c) => fetchOneChainBundle(address, c))
  );

  // If Alchemy failed on every attempted chain, this is a provider/key issue,
  // not an "empty wallet". Surface a distinct error instead of silently saying
  // "Wallet does not meet minimum requirements for scoring."
  if (bundles.every((b) => !b.alchemyOk)) {
    throwProviderError(bundles);
  }

  let merged = mergeBundles(bundles);
  let raw = toWalletRawData(address, merged);

  // Fallback: if gates fail and Ethereum wasn't in the original list, try ETH mainnet.
  if (!meetsHardGates(raw).passes && !scoreChainList.includes("ethereum")) {
    const ethBundle = await fetchOneChainBundle(address, "ethereum");
    bundles.push(ethBundle);
    merged = mergeBundles(bundles);
    raw = toWalletRawData(address, merged);
  }

  return raw;
}
