"use client";

import { useCallback, useEffect, useState } from "react";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/types";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress, type WalletRow } from "../shared";

interface Props {
  plan: SubscriptionPlan;
  onChanged: () => void;
}

export default function WalletsTab({ plan, onChanged }: Props) {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [addr, setAddr] = useState("");
  const [chain, setChain] = useState<
    "ethereum" | "arbitrum" | "base" | "avalanche" | "unichain"
  >("ethereum");
  const [submitting, setSubmitting] = useState(false);
  const { connect, isConnecting, error: walletError } = useWallet();

  const maxWallets = PLAN_LIMITS[plan]?.walletMonitors ?? 1;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallets");
      if (res.ok) {
        const json = await res.json();
        setWallets(json.wallets ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      setAddr("");
      await load();
      onChanged();
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

  async function handleRemove(walletId: string) {
    if (!confirm("Remove this wallet?")) return;
    const res = await fetch("/api/wallets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json.message ?? "Failed to remove wallet.");
      return;
    }
    await load();
    onChanged();
  }

  async function handleMakePrimary(walletId: string) {
    setMsg(null);
    const res = await fetch("/api/wallets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId, makePrimary: true }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(json.message ?? "Failed to update primary wallet.");
      return;
    }
    await load();
    onChanged();
  }

  const atLimit = wallets.length >= maxWallets;

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
          Connected Wallets
        </h1>
        <p className="text-[13px] text-cs-ink4 font-mono">
          {wallets.length}/{maxWallets} wallets on {plan} plan
        </p>
      </div>

      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        {loading ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">Loading…</p>
        ) : wallets.length === 0 ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            No wallets yet. Add one below.
          </p>
        ) : (
          wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 py-3.5 border-b border-[#f5f5f5] last:border-none"
            >
              <span className="w-10 h-10 rounded-[11px] bg-cs-green/[.08] flex items-center justify-center text-lg shrink-0">
                🔑
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[13px] font-medium text-cs-ink truncate">
                  {truncateAddress(w.address)}
                </p>
                <p className="text-[11px] text-cs-ink4 mt-0.5 capitalize">
                  {w.chain}
                  {w.isPrimary && " · Primary"}
                  {w.label && ` · ${w.label}`}
                </p>
              </div>
              <div className="text-right mr-3">
                <p className="text-base font-extrabold text-cs-ink">
                  {w.score ?? "—"}
                </p>
                <p className="text-[11px] text-cs-ink4">
                  {w.grade ?? "score"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {w.isPrimary ? (
                  <span className="badge badge-blue">Primary</span>
                ) : (
                  <button
                    onClick={() => handleMakePrimary(w.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border-[1.5px] border-cs-green/30 text-cs-green-d hover:bg-cs-green/[.08] hover:border-cs-green/50 transition"
                  >
                    Make primary
                  </button>
                )}
                {wallets.length > 1 && (
                  <button
                    onClick={() => handleRemove(w.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border-[1.5px] border-cs-border text-cs-ink2 hover:border-cs-ink3 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-4 font-mono">
          Add a wallet
        </p>
        {atLimit ? (
          <p className="text-[13px] text-cs-ink3">
            You&apos;ve reached the {maxWallets}-wallet limit on the {plan} plan.{" "}
            <a href="/pricing" className="text-cs-green-d underline">
              Upgrade
            </a>{" "}
            to add more.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
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
                {isConnecting ? "Connecting…" : "Connect MetaMask"}
              </button>
              {walletError && (
                <p className="text-xs text-red-500 mt-2">{walletError}</p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-cs-ink4 uppercase tracking-[.05em] mb-1.5 font-mono">
                Or add by address
              </label>
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
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-red-500">{msg}</p>}
      </div>
    </>
  );
}
