"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

type PlanId = "FREE" | "CONSUMER" | "PROTOCOL" | "ANALYTICS";

const PLAN_BADGE: Record<PlanId, { label: string; fg: string; bg: string }> = {
  FREE: { label: "Free", fg: "#4a5b52", bg: "rgba(17,17,17,0.06)" },
  CONSUMER: { label: "Consumer", fg: "#007a52", bg: "rgba(0,201,141,0.14)" },
  PROTOCOL: { label: "Protocol", fg: "#1a4bff", bg: "rgba(26,75,255,0.12)" },
  ANALYTICS: { label: "Analytics", fg: "#c05000", bg: "rgba(255,107,43,0.14)" },
};

export default function Nav() {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isDashboard = pathname.startsWith("/dashboard");
  const isPricing = pathname.startsWith("/pricing");
  const isContact = pathname.startsWith("/contact");
  const isDocs = pathname.startsWith("/docs");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user: clerkUser, isSignedIn } = useUser();
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch effective plan + display name once signed in.
  useEffect(() => {
    if (!isSignedIn) {
      setPlan(null);
      setDisplayName(null);
      return;
    }
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        setPlan((j.plan as PlanId) ?? "FREE");
        setDisplayName(j.name ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, pathname]);

  const isDark = isLanding && !scrolled;

  const navDisplayName =
    displayName ??
    clerkUser?.firstName ??
    clerkUser?.fullName ??
    clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    null;

  const planBadge = plan && plan !== "FREE" ? PLAN_BADGE[plan] : null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[300] flex items-center justify-between px-6 lg:px-14 h-[68px] transition-all duration-300 ${
          isDark
            ? "bg-[rgba(11,26,18,0.92)] backdrop-blur-2xl border-b border-white/[.06]"
            : "bg-white/95 backdrop-blur-md border-b border-cs-border shadow-cs-sm"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-extrabold tracking-tight select-none"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cs-green">
            <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 fill-white">
              <path d="M7 0L14 3.5V10.5L7 14L0 10.5V3.5Z" />
            </svg>
          </span>
          <span className={isDark ? "text-white" : "text-cs-ink"}>
            Zentra<span className="text-cs-green">Score</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-1.5 list-none">
          {isLanding && (
            <>
              <li>
                <a
                  href="#on-chain-scoring"
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition ${
                    isDark
                      ? "text-white/60 hover:text-white hover:bg-white/[.08]"
                      : "text-cs-ink2 hover:text-cs-ink hover:bg-cs-paper"
                  }`}
                >
                  On-chain Scoring
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition ${
                    isDark
                      ? "text-white/60 hover:text-white hover:bg-white/[.08]"
                      : "text-cs-ink2 hover:text-cs-ink hover:bg-cs-paper"
                  }`}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition ${
                    isDark
                      ? "text-white/60 hover:text-white hover:bg-white/[.08]"
                      : "text-cs-ink2 hover:text-cs-ink hover:bg-cs-paper"
                  }`}
                >
                  Pricing
                </a>
              </li>
            </>
          )}
          {!isAuthPage &&
            !isDashboard &&
            !isPricing &&
            !isContact &&
            !isDocs && (
            <li>
              <Link
                href="/docs"
                className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition ${
                  isDark
                    ? "text-white/60 hover:text-white hover:bg-white/[.08]"
                    : "text-cs-ink2 hover:text-cs-ink hover:bg-cs-paper"
                }`}
              >
                API Docs
              </Link>
            </li>
          )}
        </ul>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2.5">
          <SignedOut>
            <SignInButton>
              <button
                className={`text-sm font-semibold px-4 py-2 rounded-lg border-[1.5px] bg-transparent transition ${
                  isDark
                    ? "text-white/80 border-white/20 hover:bg-white/[.08] hover:border-white/40"
                    : "text-cs-ink border-cs-border hover:border-cs-ink3 hover:bg-cs-paper"
                }`}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="text-sm font-bold px-5 py-2 rounded-[9px] border-none bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,201,141,.35)]">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            {!isDashboard && (
              <Link
                href="/dashboard"
                className="text-sm font-bold px-5 py-2 rounded-[9px] bg-cs-green text-white transition hover:bg-cs-green-d"
              >
                Dashboard
              </Link>
            )}
            {navDisplayName && (
              <div className="hidden lg:flex items-center gap-2 pl-1 pr-1">
                <span
                  className={`text-sm font-semibold max-w-[160px] truncate ${
                    isDark ? "text-white/90" : "text-cs-ink"
                  }`}
                  title={navDisplayName}
                >
                  {navDisplayName}
                </span>
                {planBadge && (
                  <span
                    className="text-[10px] font-bold uppercase tracking-[.06em] px-2 py-[3px] rounded-full leading-none"
                    style={{ background: planBadge.bg, color: planBadge.fg }}
                  >
                    {planBadge.label}
                  </span>
                )}
              </div>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Hamburger */}
        <button
          className="flex md:hidden flex-col gap-[5px] p-1.5 bg-transparent border-none cursor-pointer"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block w-[22px] h-0.5 rounded-sm transition ${
                isDark ? "bg-white/80" : "bg-cs-ink"
              }`}
            />
          ))}
        </button>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-cs-dark z-[400] flex flex-col transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[.08]">
          <span className="text-xl font-extrabold text-white">
            Zentra<span className="text-cs-green">Score</span>
          </span>
          <button
            className="w-9 h-9 rounded-full bg-white/[.08] border-none text-white text-xl flex items-center justify-center cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col py-4 flex-1 overflow-y-auto">
          {[
            { label: "On-chain Scoring", href: "/#on-chain-scoring" },
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/pricing" },
            ...(isDashboard || isPricing || isContact || isDocs
              ? []
              : [{ label: "API Docs", href: "/docs" }]),
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="px-7 py-4 text-base font-semibold text-white/70 hover:text-white hover:bg-white/[.04] border-l-[3px] border-transparent hover:border-l-cs-green transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="px-7 py-6 border-t border-white/[.08] flex flex-col gap-3">
          <SignedOut>
            <SignInButton>
              <button className="w-full py-3 rounded-lg border-[1.5px] border-white/20 bg-transparent text-white/85 text-sm font-semibold">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="w-full py-3 rounded-[9px] bg-cs-green text-white text-sm font-bold">
                Get started
              </button>
            </SignUpButton>
          </SignedOut>
          {!isDashboard && (
            <SignedIn>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-[9px] bg-cs-green text-white text-sm font-bold text-center block"
              >
                Open Dashboard
              </Link>
            </SignedIn>
          )}
        </div>
      </div>
    </>
  );
}
