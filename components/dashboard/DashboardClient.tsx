"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { formatDistanceToNow } from "date-fns";
import type {
  ScoreResult,
  ScoreHistoryPoint,
  ScoreFactors,
  AlertPrefs,
  DashboardAlert,
  SubscriptionPlan,
} from "@/types";
import { useWallet } from "@/hooks/useWallet";
import {
  alertDotColor,
  truncateAddress,
  type DashboardWallet,
} from "./shared";

const TabFallback = () => (
  <div className="py-10 text-center text-[13px] text-cs-ink3">Loading…</div>
);

const HistoryTab = dynamic(() => import("./tabs/HistoryTab"), {
  ssr: false,
  loading: TabFallback,
});
const AlertsTab = dynamic(() => import("./tabs/AlertsTab"), {
  ssr: false,
  loading: TabFallback,
});
const LoansTab = dynamic(() => import("./tabs/LoansTab"), {
  ssr: false,
  loading: TabFallback,
});
const EligibilityTab = dynamic(() => import("./tabs/EligibilityTab"), {
  ssr: false,
  loading: TabFallback,
});
const WalletsTab = dynamic(() => import("./tabs/WalletsTab"), {
  ssr: false,
  loading: TabFallback,
});
const BillingTab = dynamic(() => import("./tabs/BillingTab"), {
  ssr: false,
  loading: TabFallback,
});
const APIKeysTab = dynamic(() => import("./tabs/APIKeysTab"), {
  ssr: false,
  loading: TabFallback,
});

interface DashboardUser {
  id: string;
  email: string;
  name: string;
  plan: SubscriptionPlan;
  wallets: DashboardWallet[];
  unreadAlerts: DashboardAlert[];
  alertPrefs: AlertPrefs | null;
}

interface Props {
  user: DashboardUser;
  initialScore?: ScoreResult | null;
  scoreHistory?: ScoreHistoryPoint[];
  justUpgraded?: boolean;
  upgradedPlan?: string | null;
}

/* ── HELPERS ── */
function gradeColor(grade: string) {
  if (grade === "Exceptional" || grade === "Very Good")
    return { c: "#00a870", bg: "rgba(0,168,112,.12)" };
  if (grade === "Good") return { c: "#1a4bff", bg: "rgba(26,75,255,.12)" };
  if (grade === "Fair") return { c: "#ff6b2b", bg: "rgba(255,107,43,.12)" };
  return { c: "#e53e3e", bg: "rgba(229,62,62,.12)" };
}

function factorColor(v: number) {
  return v >= 70 ? "#00a870" : v >= 45 ? "#ff6b2b" : "#e53e3e";
}

function factorLabelMap(
  key: keyof ScoreFactors
): { title: string; desc: string; impact: string; icon: string; bg: string; ic: string } {
  const map: Record<
    keyof ScoreFactors,
    { title: string; desc: string; impact: string; icon: string; bg: string; ic: string }
  > = {
    repaymentHistory: {
      title: "Improve repayment rate",
      desc: "Repay outstanding loans on time to push repayment rate higher.",
      impact: "+15 pts",
      icon: "💸",
      bg: "#e8f5e9",
      ic: "#00a870",
    },
    liquidationRecord: {
      title: "Strengthen collateral buffer",
      desc: "Keep health factor above 1.5 to avoid liquidations.",
      impact: "+12 pts",
      icon: "🛡️",
      bg: "#fff3e0",
      ic: "#ff6b2b",
    },
    walletAge: {
      title: "Continue on-chain activity",
      desc: "Wallet age score improves the longer your history grows.",
      impact: "+10 pts",
      icon: "⏳",
      bg: "#e8f0ff",
      ic: "#1a4bff",
    },
    assetDiversity: {
      title: "Diversify holdings",
      desc: "Hold a mix of blue-chip assets and stablecoins.",
      impact: "+8 pts",
      icon: "📊",
      bg: "#e8f0ff",
      ic: "#1a4bff",
    },
    protocolBreadth: {
      title: "Use more protocols",
      desc: "Interact with a wider set of reputable DeFi protocols.",
      impact: "+9 pts",
      icon: "🔗",
      bg: "#e8f5e9",
      ic: "#00a870",
    },
    portfolioStability: {
      title: "Reduce portfolio volatility",
      desc: "Lower meme/volatile token exposure for a more stable score.",
      impact: "+7 pts",
      icon: "📉",
      bg: "#fff3e0",
      ic: "#ff6b2b",
    },
  };
  return map[key];
}

const TABS = [
  { id: "overview", icon: "📊", label: "Overview", section: "Overview" },
  { id: "history", icon: "📈", label: "Score History", section: "Overview" },
  { id: "alerts", icon: "🔔", label: "Alerts", section: "Overview" },
  { id: "loans", icon: "💰", label: "My Loans", section: "Lending" },
  { id: "eligibility", icon: "✅", label: "Eligibility", section: "Lending" },
  { id: "wallets", icon: "🔑", label: "Wallets", section: "Settings" },
  { id: "api-keys", icon: "🗝️", label: "API Keys", section: "Settings" },
  { id: "billing", icon: "💳", label: "Billing", section: "Settings" },
];

/* ── COMPONENT ── */
export default function DashboardClient({
  user: serverUser,
  initialScore,
  scoreHistory,
  justUpgraded,
  upgradedPlan,
}: Props) {
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const validTabIds = useMemo(() => new Set(TABS.map((t) => t.id)), []);
  const urlTab = searchParams.get("tab");
  const tab = urlTab && validTabIds.has(urlTab) ? urlTab : "overview";
  const setTab = useCallback(
    (t: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (t === "overview") {
        next.delete("tab");
      } else {
        next.set("tab", t);
      }
      const qs = next.toString();
      router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
    },
    [router, searchParams]
  );
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(serverUser.unreadAlerts.length);

  const firstName = serverUser.name ?? clerkUser?.firstName ?? "User";
  const primaryWallet =
    serverUser.wallets.find((w) => w.isPrimary) ?? serverUser.wallets[0] ?? null;
  const hasWallets = serverUser.wallets.length > 0;

  const { c: GRADE_COLOR, bg: GRADE_BG } = gradeColor(initialScore?.grade ?? "");

  const FACTORS = initialScore
    ? [
        { key: "repaymentHistory" as const, name: "Repayment history", v: initialScore.factors.repaymentHistory },
        { key: "liquidationRecord" as const, name: "Liquidation record", v: initialScore.factors.liquidationRecord },
        { key: "walletAge" as const, name: "Wallet age", v: initialScore.factors.walletAge },
        { key: "assetDiversity" as const, name: "Asset diversity", v: initialScore.factors.assetDiversity },
        { key: "protocolBreadth" as const, name: "Protocol breadth", v: initialScore.factors.protocolBreadth },
        { key: "portfolioStability" as const, name: "Portfolio stability", v: initialScore.factors.portfolioStability },
      ]
    : [];

  const ringPct = initialScore ? (initialScore.score - 300) / 550 : 0;
  const ringOffset = (314 * (1 - ringPct)).toFixed(1);

  const sections = [...new Set(TABS.map((t) => t.section))];

  const recommendations = useMemo(() => {
    if (!initialScore) return [];
    return [...FACTORS]
      .sort((a, b) => a.v - b.v)
      .slice(0, 3)
      .map((f) => ({ ...factorLabelMap(f.key), value: f.v }));
  }, [initialScore, FACTORS]);

  /* ── Live unread count ── */
  useEffect(() => {
    fetch("/api/alerts?unread=true&limit=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.unreadCount != null) setUnreadCount(j.unreadCount);
      })
      .catch(() => {});
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!primaryWallet) return;
    setRefreshing(true);
    try {
      const res = await fetch(`/api/score/${primaryWallet.address}?fresh=true`);
      if (res.status === 429) {
        alert("Rate limit reached. Please wait a moment.");
      } else if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.message ?? "Failed to refresh score.");
      } else {
        router.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  }, [primaryWallet, router]);

  // Recompute score once after load so users don’t have to click “Refresh score”.
  const lastAutoRefreshAddress = useRef<string | null>(null);
  useEffect(() => {
    if (!primaryWallet) return;
    const addr = primaryWallet.address;
    let cancelled = false;
    const id = setTimeout(() => {
      if (cancelled) return;
      if (lastAutoRefreshAddress.current === addr) return;
      lastAutoRefreshAddress.current = addr;
      void handleRefresh();
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [primaryWallet?.address, handleRefresh]);

  return (
    <main data-page="dashboard" className="pt-[68px] bg-cs-paper min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-[252px_1fr] min-h-[calc(100vh-68px)]">
        {/* Sidebar */}
        <aside className="hidden lg:block bg-white border-r border-cs-border sticky top-[68px] h-[calc(100vh-68px)] overflow-y-auto cs-scroll-contain py-5">
          {sections.map((sec) => (
            <div key={sec}>
              <p className="text-[10px] font-bold text-cs-ink4 uppercase tracking-[.08em] px-[22px] pt-3.5 pb-1.5">
                {sec}
              </p>
              {TABS.filter((t) => t.section === sec).map((t) => (
                <div
                  key={t.id}
                  className={`ds-item ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.icon} {t.label}
                  {t.id === "alerts" && unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-50 text-red-500 px-[7px] py-[2px] rounded-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div
            className="ds-item mt-2"
            style={{ color: "#e53e3e" }}
            onClick={() => signOut(() => router.push("/"))}
          >
            ← Sign out
          </div>
        </aside>

        {/* Main content */}
        <div className="bg-cs-paper min-h-[calc(100vh-68px)] flex flex-col">
          <div className="w-full max-w-[1180px] mx-auto px-6 lg:px-10 pt-6 lg:pt-10 pb-14 flex-1">
            {/* Mobile tab selector */}
            <div className="lg:hidden mb-4">
              <select
                value={tab}
                onChange={(e) => setTab(e.target.value)}
                className="w-full border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm font-semibold text-cs-ink bg-white outline-none focus:border-cs-green"
              >
                {TABS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            {justUpgraded && upgradedPlan && (
              <div className="mb-6 rounded-cs-l border border-cs-green/30 bg-cs-green/[.06] px-5 py-4 text-sm text-cs-green-d">
                Welcome to <strong>{upgradedPlan}</strong>! Your plan is now active.
              </div>
            )}

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <OverviewTab
                firstName={firstName}
                hasWallets={hasWallets}
                primaryWallet={primaryWallet}
                initialScore={initialScore ?? null}
                factors={FACTORS}
                ringOffset={ringOffset}
                gradeColor={GRADE_COLOR}
                gradeBg={GRADE_BG}
                recommendations={recommendations}
                unreadAlerts={serverUser.unreadAlerts}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onGoWallets={() => setTab("wallets")}
              />
            )}

            {tab === "history" && (
              <HistoryTab
                scoreHistory={scoreHistory ?? []}
                primaryAddress={primaryWallet?.address ?? null}
              />
            )}
            {tab === "alerts" && (
              <AlertsTab
                initialAlerts={serverUser.unreadAlerts}
                initialPrefs={serverUser.alertPrefs}
                onUnreadCountChange={setUnreadCount}
              />
            )}
            {tab === "loans" && <LoansTab primaryWallet={primaryWallet} />}
            {tab === "eligibility" && (
              <EligibilityTab score={initialScore ?? null} />
            )}
            {tab === "wallets" && (
              <WalletsTab
                plan={serverUser.plan}
                onChanged={() => router.refresh()}
              />
            )}
            {tab === "billing" && (
              <BillingTab plan={serverUser.plan} email={serverUser.email} />
            )}
            {tab === "api-keys" && <APIKeysTab plan={serverUser.plan} />}
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─────────── OVERVIEW ─────────── */

function OverviewTab({
  firstName,
  hasWallets,
  primaryWallet,
  initialScore,
  factors,
  ringOffset,
  gradeColor: GRADE_COLOR,
  gradeBg: GRADE_BG,
  recommendations,
  unreadAlerts,
  refreshing,
  onRefresh,
  onGoWallets,
}: {
  firstName: string;
  hasWallets: boolean;
  primaryWallet: DashboardWallet | null;
  initialScore: ScoreResult | null;
  factors: { key: keyof ScoreFactors; name: string; v: number }[];
  ringOffset: string;
  gradeColor: string;
  gradeBg: string;
  recommendations: ReturnType<typeof factorLabelMap>[] & { value?: number }[];
  unreadAlerts: DashboardAlert[];
  refreshing: boolean;
  onRefresh: () => void;
  onGoWallets: () => void;
}) {
  const router = useRouter();
  const [computing, setComputing] = useState(false);

  // Auto-poll for first score when a wallet exists but no initialScore is cached yet.
  useEffect(() => {
    if (initialScore || !primaryWallet) return;
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 10;
    setComputing(true);

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const res = await fetch(`/api/score/${primaryWallet.address}`, {
          cache: "no-store",
        });
        if (res.ok) {
          if (!cancelled) router.refresh();
          return;
        }
      } catch {
        // swallow; retry
      }
      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, 3000);
      } else if (!cancelled) {
        setComputing(false);
      }
    };

    const firstDelay = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(firstDelay);
    };
  }, [initialScore, primaryWallet, router]);

  if (!hasWallets) {
    return (
      <div>
        <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-2">
          Welcome, {firstName}
        </h1>
        <p className="text-[14px] text-cs-ink3 mb-6">
          Add a wallet to see your real on-chain credit score.
        </p>
        <NoWalletCTA onGoWallets={onGoWallets} />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
            Good to see you, {firstName}
          </h1>
          <p className="text-[13px] text-cs-ink4 font-mono flex items-center gap-2">
            <span className="w-[7px] h-[7px] rounded-full bg-cs-green inline-block shrink-0" />
            {primaryWallet ? truncateAddress(primaryWallet.address) : "No wallet"}
            {initialScore?.computedAt && (
              <>
                &nbsp;&middot;&nbsp; Updated{" "}
                {formatDistanceToNow(new Date(initialScore.computedAt), { addSuffix: true })}
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            disabled={refreshing || !primaryWallet}
            className="text-xs font-semibold text-cs-green-d bg-cs-green/[.08] border border-cs-green/20 rounded-lg px-3.5 py-1.5 cursor-pointer hover:bg-cs-green/[.14] transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? "↻ Refreshing…" : "↻ Refresh score"}
          </button>
        </div>
      </div>

      {/* Score + Factors */}
      {initialScore ? (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 mb-5">
          <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-7 flex flex-col items-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              className="overflow-visible"
            >
              <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={GRADE_COLOR}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="314"
                strokeDashoffset={ringOffset}
                transform="rotate(-90 60 60)"
                className="transition-all duration-700"
              />
            </svg>
            <span className="text-[46px] font-extrabold text-cs-ink tracking-[-2.5px] leading-none -mt-1.5">
              {initialScore.score}
            </span>
            <span className="text-[11px] font-mono text-cs-ink4 mt-1.5 uppercase tracking-[.05em]">
              ZentraScore
            </span>
            <span
              className="text-xs font-bold px-3.5 py-1 rounded-[20px] mt-2"
              style={{ background: GRADE_BG, color: GRADE_COLOR }}
            >
              {initialScore.grade}
            </span>
          </div>
          <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
            <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
              Score factors
            </p>
            {factors.map((f) => (
              <div key={f.name} className="flex items-center gap-3 mb-3">
                <span className="text-[13px] text-cs-ink2 w-[155px] shrink-0 font-medium">
                  {f.name}
                </span>
                <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded overflow-hidden">
                  <div
                    className="fb-fill"
                    style={{ width: `${f.v}%`, background: factorColor(f.v) }}
                  />
                </div>
                <span
                  className="text-xs font-bold w-9 text-right"
                  style={{ color: factorColor(f.v) }}
                >
                  {f.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-10 mb-5 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span
              className={`inline-block w-3 h-3 rounded-full bg-cs-green ${
                computing ? "animate-pulse" : ""
              }`}
            />
            <p className="text-[15px] font-semibold text-cs-ink">
              {computing ? "Computing your first score…" : "Score pending"}
            </p>
          </div>
          <p className="text-[13px] text-cs-ink3 max-w-md mx-auto">
            We&apos;re fetching on-chain data for{" "}
            {primaryWallet ? truncateAddress(primaryWallet.address) : "your wallet"}.
            {computing
              ? " This usually takes 10–30 seconds."
              : " Click \u201CRefresh score\u201D to retry."}
          </p>
        </div>
      )}

      {/* Metrics */}
      {initialScore && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
          {[
            {
              l: "Repayment rate",
              v: `${initialScore.factors.repaymentHistory}%`,
              t:
                initialScore.factors.repaymentHistory >= 80
                  ? "Strong performance"
                  : "Room to improve",
              tc:
                initialScore.factors.repaymentHistory >= 80 ? "#00a870" : "#ff6b2b",
            },
            {
              l: "Liquidations",
              v: initialScore.factors.liquidationRecord >= 90 ? "None" : "Detected",
              t:
                initialScore.factors.liquidationRecord >= 90
                  ? "Clean record"
                  : "Past events on record",
              tc:
                initialScore.factors.liquidationRecord >= 90 ? "#00a870" : "#ff6b2b",
            },
            {
              l: "Wallet age",
              v: `${Math.max(1, Math.round((initialScore.factors.walletAge / 100) * 96))}mo`,
              t: `${initialScore.factors.walletAge}/100 score`,
              tc: undefined,
            },
            {
              l: "Best rate",
              v:
                initialScore.loanTerms.interestRateBps > 0
                  ? `${(initialScore.loanTerms.interestRateBps / 100).toFixed(2)}%`
                  : "—",
              t:
                initialScore.loanTerms.eligibleProtocols[0]
                  ? `On ${initialScore.loanTerms.eligibleProtocols[0]}`
                  : "No eligible protocols",
              tc: "#00a870",
            },
          ].map((m) => (
            <div
              key={m.l}
              className="bg-white border-[1.5px] border-cs-border rounded-[14px] p-5 hover:shadow-cs-sm transition"
            >
              <p className="text-[11px] font-semibold text-cs-ink4 uppercase tracking-[.05em] mb-2 font-mono">
                {m.l}
              </p>
              <p
                className="text-[26px] font-extrabold tracking-tight leading-none"
                style={{ color: m.tc ?? "#111" }}
              >
                {m.v}
              </p>
              <p className="text-xs text-cs-ink3 mt-1.5">{m.t}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recos + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
          <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
            Recommendations
          </p>
          {recommendations.length === 0 ? (
            <p className="text-[13px] text-cs-ink3">
              No recommendations yet. Add a wallet to get personalized tips.
            </p>
          ) : (
            recommendations.map((r, i) => (
              <div
                key={`${r.title}-${i}`}
                className="flex gap-3 items-start py-3 border-b border-[#f5f5f5] last:border-none"
              >
                <span
                  className="w-9 h-9 rounded-cs flex items-center justify-center text-base shrink-0"
                  style={{ background: r.bg }}
                >
                  {r.icon}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-cs-ink mb-0.5">
                    {r.title}
                  </p>
                  <p className="text-xs text-cs-ink3 leading-[1.5]">{r.desc}</p>
                  <p className="text-[11px] font-bold mt-1" style={{ color: r.ic }}>
                    {r.impact} estimated
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
          <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
            Recent alerts
          </p>
          {unreadAlerts.length === 0 ? (
            <p className="text-[13px] text-cs-ink3">You&apos;re all caught up.</p>
          ) : (
            unreadAlerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 py-3.5 border-b border-[#f5f5f5] last:border-none"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ background: alertDotColor(a.type) }}
                />
                <span className="text-[13.5px] text-cs-ink2 leading-[1.55] flex-1">
                  <strong className="text-cs-ink">{a.title}</strong>
                  {a.message ? ` — ${a.message}` : ""}
                </span>
                <span className="text-[11px] text-cs-ink4 font-mono shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function NoWalletCTA({ onGoWallets }: { onGoWallets: () => void }) {
  const { address, isConnecting, connect, error } = useWallet();
  const [addr, setAddr] = useState("");
  const [chain, setChain] = useState<
    "ethereum" | "arbitrum" | "base" | "avalanche" | "unichain"
  >("ethereum");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function addWallet(a: string, c: string) {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: a, chain: c }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(json.message ?? "Failed to add wallet.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConnect() {
    const a = await connect();
    if (a) await addWallet(a, chain);
  }

  async function handleAddByAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      setMsg("Enter a valid 0x Ethereum address.");
      return;
    }
    await addWallet(addr, chain);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-2 font-mono">
          Option 1
        </p>
        <h3 className="text-[18px] font-bold text-cs-ink mb-2">Connect MetaMask</h3>
        <p className="text-[13px] text-cs-ink3 mb-5 leading-[1.55]">
          One click — uses the wallet you already have in your browser. We never request funds or signing.
        </p>
        <label className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.05em] mb-1.5 font-mono">
          Network
        </label>
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value as typeof chain)}
          className="w-full mb-3 border-[1.5px] border-cs-border rounded-cs px-3 py-2.5 text-sm bg-white outline-none focus:border-cs-green"
        >
          <option value="ethereum">Ethereum</option>
          <option value="arbitrum">Arbitrum</option>
          <option value="base">Base</option>
          <option value="avalanche">Avalanche</option>
          <option value="unichain">Unichain</option>
        </select>
        <button
          onClick={handleConnect}
          disabled={isConnecting || submitting}
          className="w-full text-sm font-bold px-5 py-3 rounded-[9px] bg-cs-green text-white hover:bg-cs-green-d transition disabled:opacity-50"
        >
          {isConnecting ? "Connecting…" : submitting && address ? "Saving…" : "Connect wallet"}
        </button>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-2 font-mono">
          Option 2
        </p>
        <h3 className="text-[18px] font-bold text-cs-ink mb-2">Add by address</h3>
        <p className="text-[13px] text-cs-ink3 mb-5 leading-[1.55]">
          Paste any public wallet address. We only read public on-chain data.
        </p>
        <form onSubmit={handleAddByAddress} className="space-y-3">
          <input
            type="text"
            value={addr}
            onChange={(e) => setAddr(e.target.value.trim())}
            placeholder="0x…"
            className="w-full border-[1.5px] border-cs-border rounded-cs px-3 py-2.5 text-sm font-mono bg-white outline-none focus:border-cs-green"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full text-sm font-bold px-5 py-3 rounded-[9px] bg-cs-ink text-white hover:bg-black transition disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add wallet"}
          </button>
        </form>
      </div>
      {msg && (
        <p className="md:col-span-2 text-sm text-red-500">{msg}</p>
      )}
      <p className="md:col-span-2 text-[12px] text-cs-ink4">
        Other tab? Use the{" "}
        <button onClick={onGoWallets} className="text-cs-green-d underline">
          Wallets
        </button>{" "}
        tab any time to manage addresses.
      </p>
    </div>
  );
}
