"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, SignUpButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

type Plan = "CONSUMER" | "PROTOCOL" | "ANALYTICS";

interface Props {
  plan: Plan;
  label: string;
  className: string;
}

const STORAGE_KEY = "zs_pending_plan";

async function startCheckout(plan: Plan): Promise<string | null> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    alert(json.message ?? "Could not start checkout. Please try again.");
    return null;
  }
  return json.url ?? null;
}

export default function CheckoutButton({ plan, label, className }: Props) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);

  const go = useCallback(
    async (p: Plan) => {
      setBusy(true);
      try {
        const url = await startCheckout(p);
        if (url) window.location.href = url;
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // After a user signs up and is redirected back with ?plan=..., auto-start checkout.
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const qs = searchParams?.get("plan") as Plan | null;
    const stored =
      typeof window !== "undefined"
        ? (sessionStorage.getItem(STORAGE_KEY) as Plan | null)
        : null;
    const pending = qs ?? stored;
    if (pending && pending === plan) {
      sessionStorage.removeItem(STORAGE_KEY);
      go(pending);
      const url = new URL(window.location.href);
      url.searchParams.delete("plan");
      router.replace(url.pathname + (url.search ? url.search : ""));
    }
  }, [isLoaded, isSignedIn, searchParams, plan, go, router]);

  if (!isLoaded) {
    return (
      <button disabled className={className}>
        {label}
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignUpButton forceRedirectUrl={`/pricing?plan=${plan}`}>
        <button
          className={className}
          onClick={() => {
            if (typeof window !== "undefined") {
              sessionStorage.setItem(STORAGE_KEY, plan);
            }
          }}
        >
          {label}
        </button>
      </SignUpButton>
    );
  }

  return (
    <button
      className={className}
      disabled={busy}
      onClick={() => go(plan)}
    >
      {busy ? "Redirecting…" : label}
    </button>
  );
}
