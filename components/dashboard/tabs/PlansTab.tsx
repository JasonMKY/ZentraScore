"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import clsx from "clsx";

const TIERS = [
  {
    name: "Consumer",
    plan: "CONSUMER" as const,
    blurb: "Individuals and power users.",
  },
  {
    name: "Protocol",
    plan: "PROTOCOL" as const,
    blurb: "Batch scoring and webhooks.",
  },
  {
    name: "Analytics",
    plan: "ANALYTICS" as const,
    blurb: "Deeper reporting and seats.",
  },
];

interface Props {
  userPlan: string;
}

export default function PlansTab({ userPlan }: Props) {
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upgradePlan = useCallback(
    async (plan: "CONSUMER" | "PROTOCOL" | "ANALYTICS") => {
      setUpgrading(plan);
      setError(null);
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.message ?? "Checkout failed. Check Stripe keys.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setUpgrading(null);
      }
    },
    []
  );

  const currentPlanNorm = userPlan.toUpperCase();

  return (
    <>
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentPlanNorm === tier.plan;
          return (
            <div
              key={tier.plan}
              className={clsx(
                "flex flex-col rounded-2xl border p-6 shadow-sm transition",
                isCurrent
                  ? "border-brand ring-2 ring-brand/30 bg-brand-50/40"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {tier.name}
                </h3>
                {isCurrent && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-600">
                {tier.blurb}
              </p>
              <button
                type="button"
                onClick={() => upgradePlan(tier.plan)}
                disabled={isCurrent || upgrading !== null}
                className={clsx(
                  "mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition",
                  isCurrent
                    ? "cursor-default border border-brand/30 bg-white text-brand-dark"
                    : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                )}
              >
                {upgrading === tier.plan
                  ? "Redirecting…"
                  : isCurrent
                    ? "Active"
                    : "Upgrade"}
              </button>
            </div>
          );
        })}
        <p className="text-center text-sm text-slate-500 md:col-span-3">
          Stripe checkout requires valid{" "}
          <code className="rounded bg-slate-100 px-1">STRIPE_*</code> keys in{" "}
          <code className="rounded bg-slate-100 px-1">.env.local</code>.{" "}
          <Link
            href="/pricing"
            className="font-medium text-brand-dark hover:underline"
          >
            Pricing page
          </Link>
        </p>
      </div>
    </>
  );
}
