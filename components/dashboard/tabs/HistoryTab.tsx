"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ScoreHistoryPoint } from "@/types";

interface Props {
  scoreHistory: ScoreHistoryPoint[];
  primaryAddress: string | null;
}

export default function HistoryTab({ scoreHistory, primaryAddress }: Props) {
  const router = useRouter();
  const [recomputing, setRecomputing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function recompute() {
    if (!primaryAddress) return;
    setRecomputing(true);
    setErr(null);
    try {
      const res = await fetch(`/api/score/${primaryAddress}?fresh=true`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setErr(json.message ?? "Recompute failed.");
        return;
      }
      router.refresh();
    } finally {
      setRecomputing(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
            Score History
          </h1>
          <p className="text-[13px] text-cs-ink4 font-mono">
            Monthly trend &middot; 300–850 scale
          </p>
        </div>
        {primaryAddress && (
          <button
            onClick={recompute}
            disabled={recomputing}
            className="text-xs font-semibold text-cs-green-d bg-cs-green/[.08] border border-cs-green/20 rounded-lg px-3.5 py-1.5 hover:bg-cs-green/[.14] transition disabled:opacity-50"
          >
            {recomputing ? "↻ Recomputing…" : "↻ Recompute now"}
          </button>
        )}
      </div>
      {err && (
        <p className="mb-4 text-sm text-red-500">{err}</p>
      )}
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
          Monthly breakdown
        </p>
        {scoreHistory.length === 0 ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            No history yet — scores appear here after your first computation.
          </p>
        ) : (
          <table className="loan-table">
            <thead>
              <tr>
                <th>Recorded</th>
                <th>Score</th>
                <th>Change</th>
                <th>Key event</th>
              </tr>
            </thead>
            <tbody>
              {scoreHistory.map((r) => (
                <tr key={r.recordedAt}>
                  <td className="font-mono">
                    {format(new Date(r.recordedAt), "MMM d, yyyy")}
                  </td>
                  <td
                    className="font-bold"
                    style={{
                      color:
                        r.score >= 740
                          ? "#00a870"
                          : r.score >= 670
                            ? "#1a4bff"
                            : "#ff6b2b",
                    }}
                  >
                    {r.score}
                  </td>
                  <td
                    className="font-semibold"
                    style={{
                      color:
                        r.delta == null
                          ? "#888"
                          : r.delta > 0
                            ? "#00a870"
                            : r.delta < 0
                              ? "#e53e3e"
                              : "#888",
                    }}
                  >
                    {r.delta == null
                      ? "—"
                      : r.delta > 0
                        ? `+${r.delta}`
                        : r.delta}
                  </td>
                  <td className="text-xs text-cs-ink3">{r.keyEvent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
