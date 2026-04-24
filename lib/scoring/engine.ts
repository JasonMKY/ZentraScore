// lib/scoring/engine.ts
// The core scoring algorithm. Takes raw blockchain data, returns a 300–850 score.

import type {
  WalletRawData,
  ScoreFactors,
  ScoreResult,
  ScoreGrade,
  LoanTerms,
  FraudCheckResult,
} from "@/types";

// ─── Weights (must sum to 1.0) ───────────────────────────────────────────────
const WEIGHTS: Record<keyof ScoreFactors, number> = {
  repaymentHistory: 0.35,
  liquidationRecord: 0.20,
  walletAge: 0.15,
  assetDiversity: 0.15,
  protocolBreadth: 0.10,
  portfolioStability: 0.05,
};

const SCORE_MIN = 300;
const SCORE_MAX = 850;
const SCORE_RANGE = SCORE_MAX - SCORE_MIN;

// ─── Hard gates (fail before scoring) ────────────────────────────────────────
// Only block completely empty wallets. Age and thin history are reflected in
// score factors (e.g. walletAge), not as hard failures — a 180-day minimum was
// rejecting most real users and test wallets.

function hasNonZeroTokenHoldings(data: WalletRawData): boolean {
  return data.tokenBalances.some(
    (b) =>
      b.tokenBalance &&
      b.tokenBalance !==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
  );
}

export function meetsHardGates(data: WalletRawData): {
  passes: boolean;
  reason?: string;
} {
  const hasActivity =
    data.transfers.length > 0 ||
    hasNonZeroTokenHoldings(data) ||
    data.defiPositions.length > 0 ||
    data.hasEthBalance;

  if (!hasActivity) {
    return { passes: false, reason: "no_on_chain_activity" };
  }

  return { passes: true };
}

// ─── Anti-fraud checks ────────────────────────────────────────────────────────
export function runFraudChecks(data: WalletRawData): FraudCheckResult {
  const flags: string[] = [];

  // 1. Burst activity — more than 50 DeFi transactions in a single day
  const txsByDay = groupTransfersByDay(data.transfers);
  const maxDayTx = Math.max(...Object.values(txsByDay).map((v) => v.length), 0);
  if (maxDayTx > 50) {
    flags.push("burst_activity");
  }

  // 2. Circular fund flow — sent and received same token to/from same address within 24h
  const circularPairs = detectCircularFlow(data.transfers);
  if (circularPairs > 2) {
    flags.push("circular_fund_flow");
  }

  // 3. Wash repayment — borrow and repay same amount within minutes (score farming)
  const washCount = detectWashRepayments(data.transfers);
  if (washCount > 3) {
    flags.push("wash_repayment");
  }

  return {
    passed: flags.length === 0,
    flags,
  };
}

function groupTransfersByDay(transfers: WalletRawData["transfers"]) {
  return transfers.reduce((acc, tx) => {
    const day = tx.metadata.blockTimestamp.split("T")[0];
    acc[day] = acc[day] || [];
    acc[day].push(tx);
    return acc;
  }, {} as Record<string, typeof transfers>);
}

function detectCircularFlow(transfers: WalletRawData["transfers"]): number {
  const outbound = new Map<string, { asset: string; value: number; time: string }[]>();
  const circular: number[] = [];

  for (const tx of transfers) {
    if (tx.value && tx.asset && tx.to) {
      const key = `${tx.to}:${tx.asset}`;
      if (!outbound.has(key)) outbound.set(key, []);
      outbound.get(key)!.push({ asset: tx.asset, value: tx.value, time: tx.metadata.blockTimestamp });
    }
  }

  for (const tx of transfers) {
    if (tx.value && tx.asset && tx.from) {
      const key = `${tx.from}:${tx.asset}`;
      if (outbound.has(key)) {
        const sent = outbound.get(key)!.find(
          (s) => Math.abs(s.value - tx.value!) < 0.01 * s.value
        );
        if (sent) circular.push(1);
      }
    }
  }

  return circular.length;
}

function detectWashRepayments(transfers: WalletRawData["transfers"]): number {
  const defiTx = transfers.filter(
    (t) => t.asset === "USDC" || t.asset === "DAI" || t.asset === "USDT"
  );
  let washCount = 0;
  for (let i = 0; i < defiTx.length - 1; i++) {
    const a = defiTx[i];
    const b = defiTx[i + 1];
    const deltaMs =
      Math.abs(
        new Date(b.metadata.blockTimestamp).getTime() -
          new Date(a.metadata.blockTimestamp).getTime()
      );
    if (
      deltaMs < 5 * 60 * 1000 && // within 5 minutes
      a.value &&
      b.value &&
      Math.abs(a.value - b.value) < 0.01 * a.value
    ) {
      washCount++;
    }
  }
  return washCount;
}

// ─── Factor computations ──────────────────────────────────────────────────────

function computeRepaymentHistory(data: WalletRawData): number {
  const positions = data.defiPositions.filter((p) => p.type === "lending");
  if (positions.length === 0) return 40; // no lending history = neutral-low

  let totalBorrowed = 0;
  let totalRepaid = 0;
  let hasActiveLoan = false;

  for (const pos of positions) {
    for (const item of pos.items || []) {
      if (item.borrow_balance_quote) {
        totalBorrowed += item.borrow_balance_quote;
        hasActiveLoan = true;
      }
      if (item.supply_balance_quote) {
        totalRepaid += item.supply_balance_quote;
      }
    }
  }

  if (totalBorrowed === 0 && totalRepaid === 0) return 40;

  // Estimate repayment rate from balance ratios
  const repayRate = totalRepaid / (totalBorrowed + totalRepaid);

  // Penalise if currently has large outstanding loans relative to history
  const penaltyMultiplier = hasActiveLoan ? 0.9 : 1.0;

  return Math.round(Math.min(repayRate * 120 * penaltyMultiplier, 100));
}

function computeLiquidationRecord(data: WalletRawData): number {
  const positions = data.defiPositions.filter((p) => p.type === "lending");

  // Check health factors for current positions
  let worstHF = Infinity;
  for (const pos of positions) {
    for (const item of pos.items || []) {
      if (item.health_factor && item.health_factor < worstHF) {
        worstHF = item.health_factor;
      }
    }
  }

  // Estimate past liquidations from transfer history
  // (In production you'd parse LiquidationCall events from The Graph)
  // Heuristic: large ERC-20 transfers that look like liquidation seizures.
  // Replace with The Graph LiquidationCall events once indexing is available.
  const liquidationSignals = data.transfers.filter(
    (t) =>
      t.value !== null &&
      t.value > 0 &&
      t.category === "erc20" &&
      t.to !== null &&
      t.from !== data.address.toLowerCase() &&
      t.to !== data.address.toLowerCase()
  ).length;

  let score = 100;
  score -= liquidationSignals * 15; // each detected liquidation -15 pts

  // Current health factor penalty
  if (worstHF < 1.05) score -= 30;
  else if (worstHF < 1.2) score -= 15;
  else if (worstHF < 1.5) score -= 5;

  return Math.max(Math.min(score, 100), 0);
}

function computeWalletAge(data: WalletRawData): number {
  if (!data.firstTxDate) return 0;
  const ageMonths =
    (Date.now() - data.firstTxDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  // Full score at 96 months (8 years), scales linearly
  return Math.round(Math.min((ageMonths / 96) * 100, 100));
}

function computeAssetDiversity(data: WalletRawData): number {
  const nonZero = data.tokenBalances.filter(
    (b) => b.tokenBalance && b.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  const tokenCount = nonZero.length;

  // Base score from token count (capped at 20 tokens for full score)
  let score = Math.min((tokenCount / 20) * 80, 80);

  // Bonus for stablecoin holdings (Ethereum + Arbitrum + Base canonical addresses)
  const STABLECOINS = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC (eth)
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT (eth)
    "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI (eth)
    "0xaf88d065e77c8cc2239327c5edb3a432268e5831", // USDC (arb)
    "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT (arb)
    "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1", // DAI (arb)
    "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", // USDC (base)
    "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca", // USDbC (base bridged)
  ];
  const hasStable = data.tokenBalances.some((b) =>
    STABLECOINS.includes(b.contractAddress.toLowerCase())
  );
  if (hasStable) score = Math.min(score + 20, 100);

  return Math.round(score);
}

function computeProtocolBreadth(data: WalletRawData): number {
  const uniqueProtocols = new Set(
    data.defiPositions.map((p) => p.protocol_name.toLowerCase())
  );
  // Full score at 8+ distinct protocols
  return Math.round(Math.min((uniqueProtocols.size / 8) * 100, 100));
}

function computePortfolioStability(data: WalletRawData): number {
  if (data.transfers.length < 5) return 30;

  // Measure transfer value variance as a proxy for stability
  const values = data.transfers
    .filter((t) => t.value !== null && t.value > 0)
    .map((t) => t.value as number);

  if (values.length === 0) return 30;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation

  // Low CV = stable, High CV = volatile
  // CV < 0.5 → score 80–100, CV > 3 → score 0–20
  const score = Math.round(Math.max(0, Math.min(100, 100 - (cv / 3) * 100)));
  return score;
}

// ─── Score assembly ───────────────────────────────────────────────────────────

export function computeFactors(data: WalletRawData): ScoreFactors {
  return {
    repaymentHistory: computeRepaymentHistory(data),
    liquidationRecord: computeLiquidationRecord(data),
    walletAge: computeWalletAge(data),
    assetDiversity: computeAssetDiversity(data),
    protocolBreadth: computeProtocolBreadth(data),
    portfolioStability: computePortfolioStability(data),
  };
}

export function factorsToScore(factors: ScoreFactors): number {
  const weighted = (Object.keys(WEIGHTS) as (keyof ScoreFactors)[]).reduce(
    (sum, key) => sum + factors[key] * WEIGHTS[key],
    0
  );
  // weighted is 0–100, map to 300–850
  return Math.round(SCORE_MIN + (weighted / 100) * SCORE_RANGE);
}

export function scoreToGrade(score: number): ScoreGrade {
  if (score >= 800) return "Exceptional";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  if (score >= 300) return "Poor";
  return "No History";
}

export function computeLoanTerms(score: number): LoanTerms {
  if (score >= 800) {
    return {
      maxLtvBps: 9000,
      interestRateBps: 510,
      maxBorrowUsdc: 50000,
      eligibleProtocols: ["aave-v3", "compound-v3", "clearpool", "maple-finance", "truefi"],
    };
  }
  if (score >= 740) {
    return {
      maxLtvBps: 8500,
      interestRateBps: 620,
      maxBorrowUsdc: 35000,
      eligibleProtocols: ["aave-v3", "compound-v3", "clearpool", "truefi"],
    };
  }
  if (score >= 670) {
    return {
      maxLtvBps: 8000,
      interestRateBps: 720,
      maxBorrowUsdc: 25000,
      eligibleProtocols: ["aave-v3", "compound-v3", "clearpool"],
    };
  }
  if (score >= 580) {
    return {
      maxLtvBps: 6500,
      interestRateBps: 1140,
      maxBorrowUsdc: 5000,
      eligibleProtocols: ["aave-v3"],
    };
  }
  return {
    maxLtvBps: 0,
    interestRateBps: 0,
    maxBorrowUsdc: 0,
    eligibleProtocols: [],
  };
}

// ─── Full pipeline ────────────────────────────────────────────────────────────

export function runScoringPipeline(
  data: WalletRawData
): Omit<ScoreResult, "fromCache"> {
  const fraud = runFraudChecks(data);
  const factors = computeFactors(data);

  // Apply fraud penalties to factors
  if (fraud.flags.includes("circular_fund_flow")) {
    factors.repaymentHistory = Math.round(factors.repaymentHistory * 0.7);
  }
  if (fraud.flags.includes("wash_repayment")) {
    factors.repaymentHistory = Math.round(factors.repaymentHistory * 0.6);
    factors.liquidationRecord = Math.round(factors.liquidationRecord * 0.8);
  }

  const score = factorsToScore(factors);
  const grade = scoreToGrade(score);
  const loanTerms = computeLoanTerms(score);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return {
    address: data.address,
    score,
    grade,
    valid: true,
    factors,
    loanTerms,
    fraudFlags: fraud.flags,
    computedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
