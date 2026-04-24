"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@/types";
import { PLAN_META } from "../shared";

interface Props {
  plan: SubscriptionPlan;
  email: string;
}

export default function BillingTab({ plan, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function openPortal() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.error === "no_subscription") {
          setMsg(json.message ?? "Subscribe first to manage billing.");
        } else {
          setMsg(json.message ?? "Failed to open billing portal.");
        }
        return;
      }
      window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  const m = PLAN_META[plan];

  return (
    <>
      <div className="mb-7">
        <h1 className="text-[26px] font-extrabold text-cs-ink tracking-tight mb-1">
          Billing
        </h1>
        <p className="text-[13px] text-cs-ink4 font-mono">
          Manage your subscription
        </p>
      </div>
      <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6">
        <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[18px] font-mono">
          Current plan
        </p>
        <div className="flex items-center justify-between py-3.5 border-b border-[#f5f5f5]">
          <div>
            <p className="text-base font-bold text-cs-ink">{m.label}</p>
            <p className="text-xs text-cs-ink3 mt-0.5">
              {m.price} &middot; {m.blurb}
            </p>
          </div>
          <span
            className={`badge ${plan === "FREE" ? "badge-amber" : "badge-green"}`}
          >
            {plan === "FREE" ? "Free tier" : "Active"}
          </span>
        </div>
        <div className="py-3.5 border-b border-[#f5f5f5]">
          <p className="text-[13px] font-semibold text-cs-ink mb-[7px]">
            Account email
          </p>
          <p className="text-[13px] text-cs-ink2 font-mono">{email}</p>
        </div>
        <div className="flex flex-wrap gap-2.5 pt-3.5">
          <button
            onClick={() => router.push("/pricing")}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg border-[1.5px] border-cs-border text-cs-ink2 hover:border-cs-ink3 transition"
          >
            {plan === "FREE" ? "Upgrade plan" : "Change plan"}
          </button>
          <button
            onClick={openPortal}
            disabled={loading}
            className="text-[13px] font-semibold px-4 py-2 rounded-lg border-[1.5px] border-cs-border text-cs-ink2 hover:border-cs-ink3 transition disabled:opacity-50"
          >
            {loading ? "Opening…" : "Manage billing"}
          </button>
        </div>
        {msg && <p className="mt-4 text-sm text-red-500">{msg}</p>}
      </div>
    </>
  );
}
