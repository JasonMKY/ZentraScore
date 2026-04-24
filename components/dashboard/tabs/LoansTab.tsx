"use client";

import { useEffect, useMemo, useState } from "react";
import type { CovalentDefiItem } from "@/types";
import { truncateAddress, type DashboardWallet } from "../shared";

interface Props {
  primaryWallet: DashboardWallet | null;
}

export default function LoansTab({ primaryWallet }: Props) {
  const [positions, setPositions] = useState<CovalentDefiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!primaryWallet) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/wallet-positions?address=${primaryWallet.address}&chain=${primaryWallet.chain}`
        );
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.message ?? "Failed to load positions.");
          return;
        }
        setPositions(json.positions ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [primaryWallet]);

  const rows = useMemo(() => {
    const out: {
      protocol: string;
      asset: string;
      amount: string;
      collateral: string;
      rate: string;
      status: string;
      badge: string;
    }[] = [];
    for (const pos of positions.filter((p) => p.type === "lending")) {
      const items = pos.items ?? [];
      const collateralItem = items.find((i) => (i.supply_balance_quote ?? 0) > 0);
      for (const item of items) {
        const borrow = item.borrow_balance_quote ?? 0;
        const supply = item.supply_balance_quote ?? 0;
        if (borrow === 0 && supply === 0) continue;
        const active = borrow > 0;
        out.push({
          protocol: pos.protocol_name,
          asset: item.type ?? "—",
          amount: active
            ? `$${borrow.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            : `$${supply.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          collateral: collateralItem?.type ?? "—",
          rate: item.health_factor
            ? `HF ${item.health_factor.toFixed(2)}`
            : "—",
          status: active ? "Active" : "Supplied",
          badge: active ? "badge-blue" : "badge-green",
        });
      }
    }
    return out;
  }, [positions]);

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
          My Loans
        </h1>
        <p className="text-[13px] text-cs-ink4 font-mono">
          {primaryWallet
            ? `Positions for ${truncateAddress(primaryWallet.address)}`
            : "Connect a wallet to see your positions"}
        </p>
      </div>
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
          Lending positions
        </p>
        {!primaryWallet ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            No wallet connected yet.
          </p>
        ) : loading ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            Loading positions…
          </p>
        ) : error ? (
          <p className="text-[13px] text-red-500 py-6 text-center">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            No active lending positions found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Protocol</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Collateral</th>
                  <th>Health</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l, i) => (
                  <tr key={`${l.protocol}-${l.asset}-${i}`}>
                    <td className="font-semibold text-cs-ink">{l.protocol}</td>
                    <td className="font-mono text-xs">{l.asset}</td>
                    <td className="font-mono font-semibold">{l.amount}</td>
                    <td className="font-mono text-xs">{l.collateral}</td>
                    <td className="text-cs-green-d font-semibold">{l.rate}</td>
                    <td>
                      <span className={`badge ${l.badge}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
