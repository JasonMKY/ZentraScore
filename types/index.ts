// types/index.ts

export type ScoreGrade =
  | "Exceptional"
  | "Very Good"
  | "Good"
  | "Fair"
  | "Poor"
  | "No History";

export interface ScoreFactors {
  repaymentHistory: number;   // 0–100
  liquidationRecord: number;  // 0–100
  walletAge: number;          // 0–100
  assetDiversity: number;     // 0–100
  protocolBreadth: number;    // 0–100
  portfolioStability: number; // 0–100
}

export interface LoanTerms {
  maxLtvBps: number;        // e.g. 8000 = 80%
  interestRateBps: number;  // e.g. 720 = 7.20%
  maxBorrowUsdc: number;
  eligibleProtocols: string[];
}

export interface ScoreResult {
  address: string;
  score: number;
  grade: ScoreGrade;
  valid: boolean;
  factors: ScoreFactors;
  loanTerms: LoanTerms;
  fraudFlags: string[];
  computedAt: string;
  expiresAt: string;
  fromCache: boolean;
}

export interface ScoreHistoryPoint {
  score: number;
  grade: ScoreGrade;
  delta: number | null;
  keyEvent: string | null;
  recordedAt: string;
}

// Alchemy raw types (subset we use)
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string | null;
  /** Set when aggregating multi-chain fetches for scoring. */
  sourceChain?: string;
}

export interface AlchemyTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  metadata: { blockTimestamp: string };
  /** Set when aggregating multi-chain fetches for scoring. */
  sourceChain?: string;
}

// Covalent GoldRush types (subset)
export interface CovalentDefiItem {
  protocol_name: string;
  type: string; // 'lending', 'liquidity', etc.
  balance_quote: number;
  /** Chain this position was read from (multi-chain aggregate). */
  sourceChain?: string;
  items?: Array<{
    type: string;
    borrow_balance_quote?: number;
    supply_balance_quote?: number;
    health_factor?: number;
  }>;
}

export interface CovalentDefiResponse {
  data?: {
    items?: CovalentDefiItem[];
  };
  error?: boolean;
  error_message?: string;
}

// Scoring pipeline intermediates
export interface WalletRawData {
  address: string;
  tokenBalances: AlchemyTokenBalance[];
  transfers: AlchemyTransfer[];
  firstTxDate: Date | null;
  defiPositions: CovalentDefiItem[];
  /** True if native chain currency balance is non-zero (not in token list). */
  hasEthBalance: boolean;
}

export interface FraudCheckResult {
  passed: boolean;
  flags: string[];
}

// API request/response shapes
export interface ScoreApiRequest {
  address: string;
  fresh?: boolean;
  chains?: string[];
}

export interface BatchScoreApiRequest {
  addresses: string[];
  fresh?: boolean;
}

export interface BatchScoreApiResponse {
  results: Array<ScoreResult | null>;
  computed: number;
  cached: number;
  failed: number;
}

export interface AlertPrefs {
  scoreChangeEnabled: boolean;
  scoreChangeDelta: number;
  liquidationEnabled: boolean;
  liquidationHF: number;
  weeklyDigestEnabled: boolean;
  newEligibility: boolean;
}

export interface DashboardAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export type SubscriptionPlan = "FREE" | "CONSUMER" | "PROTOCOL" | "ANALYTICS";

export interface PlanLimits {
  requestsPerMin: number;
  batchSize: number;
  dailyQueries: number;
  historyMonths: number;
  walletMonitors: number;
  webhooks: boolean;
  oracle: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    requestsPerMin: 3,
    batchSize: 0,
    dailyQueries: 10,
    historyMonths: 1,
    walletMonitors: 1,
    webhooks: false,
    oracle: false,
  },
  CONSUMER: {
    requestsPerMin: 10,
    batchSize: 0,
    dailyQueries: 100,
    historyMonths: 12,
    walletMonitors: 3,
    webhooks: false,
    oracle: false,
  },
  PROTOCOL: {
    requestsPerMin: 300,
    batchSize: 500,
    dailyQueries: 50000,
    historyMonths: 24,
    walletMonitors: 1000,
    webhooks: true,
    oracle: true,
  },
  ANALYTICS: {
    requestsPerMin: 60,
    batchSize: 1000,
    dailyQueries: 10000,
    historyMonths: 24,
    walletMonitors: 50,
    webhooks: false,
    oracle: true,
  },
};
