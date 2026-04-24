"use client";

import type { ScoreResult } from "@/types";
import { PROTOCOL_CATALOG } from "../shared";

interface Props {
  score: ScoreResult | null;
}

export default function EligibilityTab({ score }: Props) {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
          Loan Eligibility
        </h1>
        <p className="text-[13px] text-cs-ink4 font-mono">
          {score ? (
            <>
              Based on your current score of <strong>{score.score}</strong>
            </>
          ) : (
            "Add a wallet to see eligibility"
          )}
        </p>
      </div>
      {score && score.score < 580 && (
        <div className="mb-5 rounded-cs-l border border-cs-border bg-[#fff9f0] px-5 py-4 text-[13px] text-cs-ink2 leading-relaxed">
          <strong className="text-cs-ink">
            Most lending protocols require a Fair+ score (580+).
          </strong>{" "}
          Improve your score by keeping health factors above 1.5, diversifying across
          protocols, and avoiding liquidations.
        </div>
      )}
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
          Protocol eligibility
        </p>
        {!score ? (
          <p className="text-[13px] text-cs-ink3 py-6 text-center">
            No score yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROTOCOL_CATALOG.map((p) => {
              const ok = score.loanTerms.eligibleProtocols.includes(p.slug);
              return (
                <div
                  key={p.slug}
                  className={`border-[1.5px] rounded-xl p-4 transition ${
                    ok
                      ? "border-cs-green/25 bg-cs-green/[.02]"
                      : "border-cs-border opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-xl">{p.logo}</span>
                    <span className="text-sm font-bold text-cs-ink">{p.name}</span>
                    <span
                      className={`badge ml-auto ${ok ? "badge-green" : "badge-red"}`}
                    >
                      {ok ? "Eligible" : "Locked"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <p className="text-[10px] text-cs-ink4 font-mono uppercase">Rate</p>
                      <p className="text-[13px] font-bold text-cs-ink">
                        {ok
                          ? `${(score.loanTerms.interestRateBps / 100).toFixed(2)}%`
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-cs-ink4 font-mono uppercase">LTV</p>
                      <p className="text-[13px] font-bold text-cs-ink">
                        {ok ? `${score.loanTerms.maxLtvBps / 100}%` : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-cs-ink4 font-mono uppercase">Max</p>
                      <p className="text-[13px] font-bold text-cs-ink">
                        {ok
                          ? `$${score.loanTerms.maxBorrowUsdc.toLocaleString()}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
