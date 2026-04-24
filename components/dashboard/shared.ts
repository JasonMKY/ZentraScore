import type { AlertPrefs, SubscriptionPlan } from "@/types";

export interface DashboardWallet {
  id: string;
  address: string;
  chain: string;
  isPrimary: boolean;
  label: string | null;
}

export interface WalletRow extends DashboardWallet {
  score: number | null;
  grade: string | null;
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function alertDotColor(type: string) {
  if (type === "LIQUIDATION_RISK") return "#ff6b2b";
  if (type === "NEW_ELIGIBILITY") return "#1a4bff";
  if (type === "SCORE_EXPIRED") return "#bbb";
  return "#00a870";
}

export function defaultPrefs(): AlertPrefs {
  return {
    scoreChangeEnabled: true,
    scoreChangeDelta: 20,
    liquidationEnabled: true,
    liquidationHF: 1.3,
    weeklyDigestEnabled: false,
    newEligibility: true,
  };
}

export const PROTOCOL_CATALOG: { slug: string; name: string; logo: string }[] = [
  { slug: "aave-v3", name: "Aave V3", logo: "🔵" },
  { slug: "compound-v3", name: "Compound III", logo: "🟢" },
  { slug: "maker", name: "MakerDAO", logo: "🔶" },
  { slug: "clearpool", name: "Clearpool", logo: "🟣" },
  { slug: "truefi", name: "TrueFi", logo: "⚫" },
  { slug: "maple-finance", name: "Maple Finance", logo: "🍁" },
];

export const PLAN_META: Record<
  SubscriptionPlan,
  { label: string; price: string; blurb: string }
> = {
  FREE: { label: "Free", price: "$0", blurb: "Starter features" },
  CONSUMER: { label: "Consumer", price: "$9 / month", blurb: "For individuals" },
  PROTOCOL: { label: "Protocol API", price: "$499 / month", blurb: "For teams & protocols" },
  ANALYTICS: { label: "Analytics", price: "$299 / month", blurb: "Bulk scoring & exports" },
};
