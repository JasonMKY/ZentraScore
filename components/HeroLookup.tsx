"use client";

import { useState, FormEvent } from "react";

const DEMO: Record<
  string,
  {
    score: number;
    grade: string;
    color: string;
    bg: string;
    rate: number;
    ltv: number;
    max: number;
    factors: Record<string, number>;
  }
> = {
  "0x71c7": {
    score: 734,
    grade: "Good",
    color: "#1a4bff",
    bg: "rgba(26,75,255,.12)",
    rate: 7.2,
    ltv: 80,
    max: 25000,
    factors: {
      Repayment: 84,
      Liquidations: 90,
      "Wallet age": 55,
      "Asset diversity": 62,
      Protocols: 73,
      Stability: 48,
    },
  },
  "0xd8da": {
    score: 812,
    grade: "Exceptional",
    color: "#00a870",
    bg: "rgba(0,201,141,.12)",
    rate: 5.1,
    ltv: 90,
    max: 50000,
    factors: {
      Repayment: 97,
      Liquidations: 100,
      "Wallet age": 88,
      "Asset diversity": 79,
      Protocols: 85,
      Stability: 71,
    },
  },
  "0xab5a": {
    score: 641,
    grade: "Fair",
    color: "#ff6b2b",
    bg: "rgba(255,107,43,.12)",
    rate: 11.4,
    ltv: 65,
    max: 5000,
    factors: {
      Repayment: 61,
      Liquidations: 60,
      "Wallet age": 40,
      "Asset diversity": 55,
      Protocols: 48,
      Stability: 35,
    },
  },
};

function match(addr: string) {
  const a = addr.toLowerCase().trim();
  if (a.length < 6) return null;
  const key = Object.keys(DEMO).find((k) => a.startsWith(k));
  return DEMO[key ?? "0x71c7"];
}

export default function HeroLookup() {
  const [addr, setAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(typeof DEMO)[string] | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!addr || addr.length < 6) {
      setError("Please enter a valid Ethereum address (0x...)");
      setResult(null);
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const d = match(addr);
    setLoading(false);
    if (d) setResult(d);
    else setError("No on-chain history found. Min 6 months of DeFi activity required.");
  }

  return (
    <div className="max-w-[480px]">
      <form
        onSubmit={onSubmit}
        className="flex bg-white/[.07] border-[1.5px] border-white/[.14] rounded-[11px] overflow-hidden transition focus-within:border-cs-green"
      >
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          className="flex-1 border-none outline-none bg-transparent font-mono text-[12.5px] px-4 py-3.5 text-white/85 placeholder:text-white/[.28]"
          placeholder="0x71C7656EC7ab88b098defB751B7401B5f6d897..."
          maxLength={42}
        />
        <button
          type="submit"
          className="bg-cs-green text-white text-[13px] font-bold border-none px-5 cursor-pointer hover:bg-cs-green-d transition whitespace-nowrap"
        >
          Look up score
        </button>
      </form>
      <p className="text-[11px] text-white/[.28] mt-2">
        Try: <b className="text-cs-green/70 font-medium">0xd8da...</b> for
        Exceptional &middot;{" "}
        <b className="text-cs-green/70 font-medium">0xab5a...</b> for Fair
      </p>

      {loading && (
        <div className="mt-3.5 bg-white/[.06] border-[1.5px] border-white/10 rounded-xl p-5 text-center">
          <div className="cs-spinner mx-auto mb-2" />
          <p className="text-xs text-white/40 font-mono">
            Fetching on-chain data...
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 px-3.5 bg-red-500/15 border border-red-500/30 rounded-lg text-xs text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-3.5 bg-white/[.06] border-[1.5px] border-white/10 rounded-xl p-[18px_20px] animate-fade-in">
          <div className="flex justify-between items-start mb-3.5">
            <div>
              <p className="text-[10px] text-white/30 font-mono tracking-[.06em] mb-1">
                ZENTRASCORE
              </p>
              <p
                className="text-[46px] font-extrabold leading-none tracking-tighter"
                style={{ color: result.color }}
              >
                {result.score}
              </p>
              <span
                className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-[20px] mt-1.5"
                style={{ background: result.bg, color: result.color }}
              >
                {result.grade}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/30 mb-1">Best available rate</p>
              <p className="text-2xl font-extrabold text-cs-green tracking-tight">
                {result.rate}% APR
              </p>
              <p className="text-[11px] text-white/[.38] mt-1">
                up to {result.ltv}% LTV &middot; max $
                {result.max.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-3 border-t border-white/[.07]">
            {Object.entries(result.factors).map(([k, v]) => (
              <div
                key={k}
                className="text-[11px] text-white/45 flex justify-between"
              >
                <span>{k}</span>
                <span className="text-white/80 font-semibold">{v}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
