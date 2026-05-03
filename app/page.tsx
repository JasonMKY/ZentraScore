import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import HeroLookup from "@/components/HeroLookup";

export const metadata: Metadata = {
  title: {
    absolute:
      "ZentraScore — Crypto Credit Score for DeFi & On-Chain Lending",
  },
  description:
    "ZentraScore is the leading crypto credit score for DeFi. Get an on-chain, blockchain-verified cryptocurrency credit score to unlock undercollateralized lending, lower rates, and higher limits.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ZentraScore — Crypto Credit Score for DeFi",
    description:
      "The first on-chain credit scoring infrastructure for DeFi. A crypto credit score built from every borrow, repayment, and liquidation across 18+ protocols.",
    url: "/",
    type: "website",
  },
};

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */

const partners = [
  "Ethereum",
  "Arbitrum",
  "Base",
  "Avalanche",
  "Unichain",
];

const features = [
  {
    icon: "🛡️",
    bg: "#e8f5e9",
    title: "All Major DeFi Protocols",
    desc: "We track repayment behavior across Aave, Compound, MakerDAO, and 15 more. Your entire DeFi history feeds your score automatically.",
  },
  {
    icon: "⚡",
    bg: "#e8f0ff",
    title: "Instant Score Lookups",
    desc: "Paste any Ethereum address and get a full score breakdown in under 2 seconds — cached for 1 hour and updated on every new on-chain event.",
  },
  {
    icon: "🌐",
    bg: "#fff3e0",
    title: "Multi-Chain Coverage",
    desc: "Cross-chain scores aggregated from Ethereum, Arbitrum, Base, Avalanche, and Unichain. One number, every chain you've ever touched.",
  },
  {
    icon: "🔒",
    bg: "#fce4ec",
    title: "Fraud-Resistant Scoring",
    desc: "Sybil detection, wash-repayment analysis, and circular fund flow checks — four layers of anti-fraud protect every single score.",
  },
  {
    icon: "📈",
    bg: "#e8f5e9",
    title: "Score Improvement Tips",
    desc: "Personalised recommendations show exactly which actions will raise your score and by how many points — no guesswork required.",
  },
  {
    icon: "🔗",
    bg: "#e3f2fd",
    title: "Trustless On-Chain Oracle",
    desc: "Smart contracts read your score directly from the blockchain. No API key, no intermediary, no trust required by your lender.",
  },
];

const testimonials = [
  {
    stars: 5,
    title: '"Reduced our default rate by 34% in 90 days"',
    body: "The on-chain oracle makes it completely trustless — our smart contracts read ZentraScore directly. Integration took less than a day and the ROI was immediate.",
    name: "Elena Vasquez",
    role: "Head of Risk · ClearLend Protocol",
    color: "#1a4bff",
  },
  {
    stars: 5,
    title: '"Saved us 6 months of engineering work"',
    body: "18 months of indexed history across every major protocol. We tried building this ourselves — ZentraScore's data moat is real and impossible to replicate quickly.",
    name: "Marcus Okonkwo",
    role: "CTO · OpenBorrow DAO",
    color: "#00a870",
  },
  {
    stars: 4,
    title: '"Good borrowers now get 40% lower rates"',
    body: "Borrowers with scores above 740 finally get rates that reflect their creditworthiness. Retention improved dramatically — good actors stay because they're rewarded.",
    name: "Priya Nair",
    role: "Protocol Lead · ChainFi Labs",
    color: "#ff6b2b",
  },
];

const pricingPlans = [
  {
    tag: "Personal",
    tagColor: "#bbb",
    name: "Consumer",
    desc: "For individual DeFi users who want to understand and improve their on-chain credit standing.",
    price: "$9",
    period: "per month",
    feats: [
      "Live score with factor breakdown",
      "Full 12-month score history",
      "Improvement recommendations",
      "Real-time score change alerts",
      "Loan eligibility previews",
    ],
    btnClass: "bg-cs-dark text-white hover:bg-[#1a4bff]",
    btnText: "Get started",
    featured: false,
  },
  {
    tag: "Most popular",
    tagColor: "#00c98d",
    name: "Protocol API",
    desc: "For DeFi protocols integrating credit scoring into their lending or risk infrastructure.",
    price: "$299",
    period: "/ month + $0.10 per query",
    feats: [
      "REST API + on-chain oracle",
      "Webhook score change events",
      "Batch scoring up to 50k/day",
      "99.9% SLA with status page",
      "Custom weight configuration",
      "Dedicated support",
    ],
    btnClass:
      "bg-cs-green text-white hover:bg-cs-green-d hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,201,141,.35)]",
    btnText: "Start free trial",
    featured: true,
  },
  {
    tag: "Enterprise",
    tagColor: "#bbb",
    name: "Risk Analytics",
    desc: "For funds, DAOs, and research teams needing portfolio-level credit risk intelligence.",
    price: "$499",
    period: "per month",
    feats: [
      "Portfolio risk dashboard",
      "Score distribution analytics",
      "Default prediction reports",
      "CSV + API data export",
      "Up to 50 wallet monitors",
    ],
    btnClass:
      "bg-transparent text-cs-ink border-[1.5px] border-cs-border hover:border-cs-ink3 hover:bg-cs-paper",
    btnText: "Contact sales",
    featured: false,
  },
];

const factors = [
  { name: "Repayment rate", pct: 84, w: "35%", color: "#00c98d" },
  { name: "Liquidations", pct: 90, w: "20%", color: "#00c98d" },
  { name: "Wallet age", pct: 55, w: "15%", color: "#ff6b2b" },
  { name: "Asset diversity", pct: 62, w: "15%", color: "#ff6b2b" },
  { name: "Protocol breadth", pct: 73, w: "10%", color: "#00c98d" },
  { name: "Stability", pct: 48, w: "5%", color: "#e53e3e" },
];

const faqs = [
  {
    q: "What is a crypto credit score?",
    a: "A crypto credit score is a credit rating computed entirely from on-chain activity — borrows, repayments, liquidations, asset diversity, and wallet age. Unlike a traditional credit score, a crypto credit score is permissionless, transparent, and verifiable on the blockchain. ZentraScore produces a cryptocurrency credit score between 300 and 850 so DeFi protocols can price risk without KYC or bank data.",
  },
  {
    q: "How is a cryptocurrency credit score calculated?",
    a: "ZentraScore indexes every borrow, repayment, and liquidation across 18+ DeFi protocols on Ethereum, Arbitrum, Base, Avalanche, and Unichain. Six weighted factors — repayment history (35%), liquidation record (20%), wallet age (15%), asset diversity (15%), protocol breadth (10%), and stability (5%) — combine into a single 300–850 credit score with Sybil detection and wash-repayment checks applied before publication.",
  },
  {
    q: "Is a blockchain credit score the same as a traditional credit score?",
    a: "No. A blockchain credit score uses only public on-chain data, so there's no reliance on banks, bureaus, or SSNs. A traditional FICO credit score measures fiat borrowing; a crypto credit score measures DeFi behavior. The two can coexist — the ZentraScore on-chain credit score is designed for lending protocols, dApps, and undercollateralized lending where traditional credit data isn't available.",
  },
  {
    q: "Does my on-chain credit score affect my real-world credit?",
    a: "No. Your ZentraScore crypto credit score is separate from any traditional credit bureau and does not impact your FICO, Equifax, Experian, or TransUnion score. It only reflects your on-chain DeFi activity and is used by DeFi protocols, not traditional lenders.",
  },
  {
    q: "How do DeFi protocols use my crypto credit score?",
    a: "Lending protocols read the ZentraScore on-chain credit score via our smart-contract oracle to determine loan-to-value ratios, interest rates, and borrow limits. A higher cryptocurrency credit score unlocks undercollateralized loans, better APRs, and higher caps — the same way a high credit score unlocks a better mortgage in traditional finance.",
  },
  {
    q: "How do I improve my crypto credit score?",
    a: "Repay loans on time, avoid liquidations, keep a diverse portfolio, and maintain activity across multiple reputable DeFi protocols. ZentraScore surfaces personalised recommendations in the dashboard that rank each action by its expected point impact on your on-chain credit score.",
  },
  {
    q: "Is ZentraScore trustless?",
    a: "Yes. Scores are published by a 2-of-3 multi-oracle network and written to the on-chain CreditScoreOracle contract. Any lending protocol can read your crypto credit score directly on-chain — no API key, no intermediary, no trust required.",
  },
  {
    q: "How often is my on-chain credit score updated?",
    a: "Your ZentraScore crypto credit score recomputes on every relevant on-chain event (borrow, repayment, liquidation), is cached for one hour for reads, and is republished to the on-chain oracle with a 7-day TTL so lenders always see a fresh rating.",
  },
];

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ZentraScore",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  url: "/",
  description:
    "ZentraScore is the first on-chain crypto credit score for DeFi. Index wallet behavior across 18+ DeFi protocols and unlock undercollateralized lending, better rates, and higher limits.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "184",
    bestRating: "5",
    worstRating: "1",
  },
  featureList: [
    "On-chain crypto credit score (300–850)",
    "Cryptocurrency credit score API",
    "REST API + on-chain oracle",
    "Score webhooks and alerts",
    "Multi-chain coverage (Ethereum, Arbitrum, Base, Avalanche, Unichain)",
    "Sybil and fraud detection",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <main className="pt-[68px]">
      <ScrollReveal />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* ── HERO ─────────────────────────────────────── */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-68px)] bg-cs-dark px-4 sm:px-6 md:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 overflow-hidden"
      >
        {/* Ambient glows */}
        <div className="absolute -top-[300px] -left-[200px] w-[800px] h-[800px] rounded-full bg-[radial-gradient(ellipse,rgba(0,201,141,.12),transparent_65%)] pointer-events-none" />
        <div className="absolute -bottom-[200px] -right-[100px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(0,201,141,.07),transparent_65%)] pointer-events-none" />

        <div className="relative z-[2] max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.05fr_1fr] items-center gap-10 md:gap-8 lg:gap-12 min-h-[calc(100vh-180px)]">
        {/* Left */}
        <div className="md:pr-6 lg:pr-12">
          <div className="inline-flex items-center gap-2 bg-cs-green/[.12] border border-cs-green/25 text-cs-green text-[11px] sm:text-xs font-semibold px-3.5 sm:px-4 py-1.5 rounded-full mb-6 sm:mb-8 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-cs-green animate-pulse2" />
            <span className="truncate">
              Live on Ethereum &middot; Arbitrum &middot; Base &middot; Avalanche &middot; Unichain
            </span>
          </div>

          <h1 className="text-[clamp(32px,5vw,62px)] font-extrabold leading-[1.08] tracking-[-1px] sm:tracking-[-1.5px] md:tracking-[-2px] text-white mb-5 animate-fade-up [animation-delay:.08s]">
            Crypto Credit Score,
            <br />
            Built On-Chain for
            <br />
            <em className="not-italic text-cs-green">DeFi Lending</em>
          </h1>

          <p className="text-[15px] sm:text-base text-white/[.55] leading-[1.75] max-w-[480px] mb-8 sm:mb-9 animate-fade-up [animation-delay:.16s]">
            ZentraScore is the first on-chain credit score for DeFi — a
            cryptocurrency credit score built from every borrow, repayment, and
            liquidation on-chain. Unlock undercollateralized lending, better
            rates, and higher limits, with no banks and no paperwork.
          </p>

          <div className="flex gap-3 flex-wrap mb-10 animate-fade-up [animation-delay:.24s]">
            <Link
              href="/sign-up"
              className="text-[15px] font-bold px-6 sm:px-7 py-3 rounded-cs bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,201,141,.4)] inline-flex items-center gap-2"
            >
              Get my crypto credit score &rarr;
            </Link>
            <a
              href="#on-chain-scoring"
              className="text-[15px] font-semibold px-5 sm:px-6 py-3 rounded-cs bg-transparent text-white/80 border-[1.5px] border-white/[.18] cursor-pointer transition hover:border-white/45 hover:text-white hover:bg-white/[.06] inline-flex items-center gap-2"
            >
              See on-chain scoring
            </a>
          </div>

          <div className="mb-9 animate-fade-up [animation-delay:.2s]">
            <HeroLookup />
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-8 lg:gap-10 pt-8 sm:pt-9 border-t border-white/[.08] animate-fade-up [animation-delay:.32s]">
            {[
              { v: "$10", em: "M+", l: "Transactions" },
              { v: "2000", em: "+", l: "Active Users" },
              { v: "80", em: "%", l: "Revenue Growth" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-[24px] sm:text-[28px] font-extrabold text-white tracking-tight">
                  {s.v}
                  <em className="not-italic text-cs-green">{s.em}</em>
                </p>
                <p className="text-[11px] sm:text-xs text-white/[.38] mt-0.5 font-medium">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Hero Card */}
        <div className="hidden md:flex relative items-center justify-center lg:justify-end animate-fade-up [animation-delay:.2s]">
          <div className="relative w-full max-w-[340px] lg:max-w-[400px]">
            {/* Floating card top-left (desktop-only to avoid clipping on tablets) */}
            <div className="hfc hidden lg:block -top-7 -left-11 animate-float z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-[30px] h-[30px] rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[15px]">
                  💳
                </span>
                <div>
                  <p className="text-xs font-bold text-cs-dark">
                    Money Transfer
                  </p>
                  <p className="text-[10px] text-cs-ink3 mt-px">
                    0x71C7 → 0xAb5a
                  </p>
                </div>
                <span className="text-[13px] font-extrabold text-cs-green-d ml-2">
                  +$240
                </span>
              </div>
            </div>

            {/* Main card */}
            <div className="bg-white rounded-[22px] p-7 shadow-[0_40px_100px_rgba(0,0,0,.45),0_0_0_1px_rgba(255,255,255,.05)]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-[30px] h-[30px] rounded-[9px] bg-cs-green flex items-center justify-center">
                    <svg
                      viewBox="0 0 14 14"
                      className="w-[15px] h-[15px] fill-white"
                    >
                      <path d="M7 0L14 3.5V10.5L7 14L0 10.5V3.5Z" />
                    </svg>
                  </span>
                  <span className="text-[15px] font-extrabold text-cs-dark tracking-tight">
                    Zentra<span className="text-cs-green">Score</span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cs-green-d bg-cs-green/10 px-2 py-0.5 rounded-[20px]">
                  <span className="w-[5px] h-[5px] rounded-full bg-cs-green animate-pulse2" />
                  Live
                </span>
              </div>

              <div className="flex items-end gap-3.5 mb-4">
                <span className="text-[60px] font-extrabold text-cs-dark leading-none tracking-[-3px]">
                  734
                </span>
                <div className="pb-2">
                  <span className="text-xs font-bold bg-cs-green/10 text-cs-green-d px-2.5 py-0.5 rounded-md inline-block mb-1">
                    Good
                  </span>
                  <p className="text-[11px] text-cs-ink4">Score: 300 – 850</p>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-cs-ink4 mb-1.5">
                <span>300 Poor</span>
                <span>850 Exceptional</span>
              </div>
              <div className="h-2 bg-[#f0f0f0] rounded-lg overflow-hidden mb-5">
                <div className="hc-bar-fill loaded" />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-[18px] border-t border-[#f3f3f3]">
                {[
                  { v: "84%", l: "Repayment", c: "#00a870" },
                  { v: "7.2%", l: "Best Rate", c: "#1a4bff" },
                  { v: "1", l: "Liquidations", c: "#ff6b2b" },
                ].map((f) => (
                  <div key={f.l} className="text-center">
                    <p
                      className="text-[15px] font-extrabold"
                      style={{ color: f.c }}
                    >
                      {f.v}
                    </p>
                    <p className="text-[10px] text-cs-ink4 mt-0.5 font-medium">
                      {f.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating card bottom-right (desktop-only to avoid clipping on tablets) */}
            <div className="hfc hidden lg:block -bottom-6 -right-[38px] animate-float-delayed z-10">
              <div className="flex items-center gap-2.5">
                <span className="w-[30px] h-[30px] rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[15px]">
                  ✅
                </span>
                <div>
                  <p className="text-xs font-bold text-cs-dark">
                    Loan Approved
                  </p>
                  <p className="text-[10px] text-cs-ink3 mt-px">
                    Aave V3 &middot; 80% LTV
                  </p>
                </div>
                <span className="text-[13px] font-extrabold text-cs-green-d ml-2">
                  $25k
                </span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────── */}
      <div className="bg-[#f9faf9] border-y border-cs-border px-4 sm:px-6 lg:px-14 py-6 flex items-center gap-6 sm:gap-8 lg:gap-10 flex-wrap">
        <span className="text-xs font-semibold text-cs-ink4 uppercase tracking-[.06em] whitespace-nowrap">
          Integrated with
        </span>
        <div className="flex items-center gap-5 sm:gap-7 lg:gap-9 flex-wrap flex-1">
          {partners.map((p) => (
            <span
              key={p}
              className="text-[15px] font-bold text-[#aab5aa] tracking-tight hover:text-[#4a7a5a] transition cursor-default"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* ── ON-CHAIN SCORING ─────────────────────────── */}
      <section id="on-chain-scoring" className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-14 sm:mb-16 lg:mb-20 reveal">
            <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
              On-chain Scoring
            </span>
            <h2 className="text-[clamp(26px,3.5vw,44px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.5px] leading-[1.08] mb-3.5 mx-auto">
              From wallet address to a
              <br className="hidden sm:inline" />
              {" "}verified on-chain credit score
            </h2>
            <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[520px] mx-auto">
              Turn your on-chain history into a trustless cryptocurrency credit
              score — no forms, no documents, no banks.
            </p>
          </div>

          {/* Timeline */}
          <div className="hiw-timeline flex flex-col">
            {/* Step 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-4 lg:gap-0 items-center relative z-[1] pb-16 lg:pb-[72px] reveal">
              {/* Card */}
              <div className="bg-white border-[1.5px] border-cs-border rounded-[20px] p-8 lg:p-9 transition hover:shadow-cs-lg hover:border-cs-green/30 hover:-translate-y-0.5 relative overflow-hidden before:absolute before:inset-0 before:rounded-[20px] before:bg-gradient-to-br before:from-cs-green/[.03] before:to-transparent before:pointer-events-none">
                <h3 className="text-[22px] font-extrabold text-cs-ink tracking-tight leading-[1.15] mb-3.5">
                  Index your
                  <br />
                  on-chain history
                </h3>
                <p className="text-sm text-cs-ink3 leading-[1.75] mb-6 max-w-[380px]">
                  Our subgraph listens to events across every major DeFi
                  protocol in real time — every borrow, repayment, and
                  liquidation is captured, timestamped, and attributed to your
                  wallet address.
                </p>
                <div className="flex gap-2.5 flex-wrap mb-6">
                  {[
                    { icon: "📡", text: "18+ protocols indexed" },
                    { icon: "⚡", text: "<2s event latency" },
                    { icon: "🔗", text: "5 chains covered" },
                  ].map((s) => (
                    <span
                      key={s.text}
                      className="flex items-center gap-[7px] bg-cs-paper border-[1.5px] border-cs-border rounded-cs px-3.5 py-2 text-xs font-semibold text-cs-ink2"
                    >
                      <span>{s.icon}</span>
                      {s.text}
                    </span>
                  ))}
                </div>
                <div className="flex gap-[7px] flex-wrap mb-6">
                  {[
                    "Aave V3",
                    "Compound III",
                    "MakerDAO",
                    "Uniswap V3",
                    "Curve",
                    "Spark",
                    "+ 12 more",
                  ].map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-semibold bg-cs-paper border border-cs-border text-cs-ink2 px-2.5 py-1 rounded-[20px]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-cs-green-d hover:gap-2.5 transition-all"
                >
                  Learn about data sources <span>→</span>
                </Link>
              </div>

              {/* Node */}
              <div className="hidden lg:flex items-center justify-center relative z-[2]">
                <span className="w-16 h-16 rounded-full bg-cs-green flex items-center justify-center shadow-[0_0_0_8px_rgba(0,201,141,.12),0_8px_32px_rgba(0,201,141,.4)]">
                  <svg
                    aria-hidden
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              {/* Right — code panel */}
              <div className="hidden lg:flex items-center pl-5">
                <div className="bg-cs-dark rounded-[16px] p-[22px] w-full max-w-[340px] font-mono text-[11.5px] leading-[1.9] text-white/55">
                  <p className="text-cs-green/60 mb-2.5 text-[10px] tracking-[.08em] uppercase">
                    // Live event stream
                  </p>
                  <p>
                    <span className="kw">Borrow</span>{" "}
                    <span className="jk">0x71C7...</span>{" "}
                    <span className="str">$12,500 USDC</span>
                  </p>
                  <p className="text-white/25">
                    Aave V3 &middot; block #19847231
                  </p>
                  <p className="mt-2">
                    <span className="kw">Repay</span>{" "}
                    <span className="jk">0x71C7...</span>{" "}
                    <span className="str">$5,000 USDC</span>
                  </p>
                  <p className="text-white/25">
                    Compound III &middot; block #19851089
                  </p>
                  <p className="mt-2">
                    <span className="text-red-400">Liq.</span>{" "}
                    <span className="jk">0xAb5a...</span>{" "}
                    <span className="text-red-400">$3,100 USDC</span>
                  </p>
                  <p className="text-white/25">
                    Aave V2 &middot; block #19854201
                  </p>
                  <p className="mt-3 pt-2.5 border-t border-white/[.07] text-cs-green/50 text-[10px]">
                    ▶ 2,400,000 wallets indexed
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-4 lg:gap-0 items-center relative z-[1] pb-16 lg:pb-[72px] reveal">
              {/* Left — score panel */}
              <div className="hidden lg:flex items-center justify-end pr-5">
                <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-[22px] w-full max-w-[340px] shadow-cs-md">
                  <p className="text-[11px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-3.5 font-mono">
                    Score computation
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {factors.map((f) => (
                      <div
                        key={f.name}
                        className="flex items-center gap-2.5"
                      >
                        <span className="text-xs text-cs-ink3 w-[130px] shrink-0 font-medium">
                          {f.name}
                        </span>
                        <div className="flex-1 h-[5px] bg-[#eee] rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${f.pct}%`,
                              background: f.color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-cs-ink w-[30px] text-right">
                          {f.w}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-cs-border">
                    <span className="text-xs text-cs-ink3">Final score</span>
                    <span className="text-[28px] font-extrabold text-cs-ink tracking-tight">
                      734
                      <span className="text-[13px] text-cs-green-d font-bold ml-2">
                        Good
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Node */}
              <div className="hidden lg:flex items-center justify-center relative z-[2]">
                <span className="w-16 h-16 rounded-full bg-cs-green flex items-center justify-center shadow-[0_0_0_8px_rgba(0,201,141,.12),0_8px_32px_rgba(0,201,141,.4)]">
                  <svg
                    aria-hidden
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              {/* Card */}
              <div className="bg-white border-[1.5px] border-cs-border rounded-[20px] p-8 lg:p-9 transition hover:shadow-cs-lg hover:border-cs-green/30 hover:-translate-y-0.5 relative overflow-hidden before:absolute before:inset-0 before:rounded-[20px] before:bg-gradient-to-br before:from-cs-green/[.03] before:to-transparent before:pointer-events-none">
                <h3 className="text-[22px] font-extrabold text-cs-ink tracking-tight leading-[1.15] mb-3.5">
                  Compute your
                  <br />
                  weighted credit score
                </h3>
                <p className="text-sm text-cs-ink3 leading-[1.75] mb-6 max-w-[380px]">
                  Six behavioural factors are extracted from your indexed
                  history, normalised, and combined using a weighted model —
                  producing a final score between 300 and 850.
                </p>
                <div className="flex gap-2.5 flex-wrap mb-6">
                  {[
                    { icon: "⚙️", text: "6 weighted factors" },
                    { icon: "🎯", text: "300–850 score range" },
                    { icon: "🔄", text: "Updates on every event" },
                  ].map((s) => (
                    <span
                      key={s.text}
                      className="flex items-center gap-[7px] bg-cs-paper border-[1.5px] border-cs-border rounded-cs px-3.5 py-2 text-xs font-semibold text-cs-ink2"
                    >
                      <span>{s.icon}</span>
                      {s.text}
                    </span>
                  ))}
                </div>
                <div className="bg-cs-green/[.06] border border-cs-green/[.18] rounded-xl p-3.5 px-4 mb-6">
                  <p className="text-xs font-bold text-cs-green-x mb-1">
                    Anti-fraud layer included
                  </p>
                  <p className="text-[13px] text-cs-ink3 leading-[1.6]">
                    Sybil detection, wash-repayment analysis, and circular fund
                    flow checks run before every score is issued.
                  </p>
                </div>
                <Link
                  href="#features"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-cs-green-d hover:gap-2.5 transition-all"
                >
                  See all score factors <span>→</span>
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_80px_1fr] gap-4 lg:gap-0 items-center relative z-[1] reveal">
              {/* Card */}
              <div className="bg-white border-[1.5px] border-cs-border rounded-[20px] p-8 lg:p-9 transition hover:shadow-cs-lg hover:border-cs-green/30 hover:-translate-y-0.5 relative overflow-hidden before:absolute before:inset-0 before:rounded-[20px] before:bg-gradient-to-br before:from-cs-green/[.03] before:to-transparent before:pointer-events-none">
                <h3 className="text-[22px] font-extrabold text-cs-ink tracking-tight leading-[1.15] mb-3.5">
                  Write it trustlessly
                  <br />
                  on-chain
                </h3>
                <p className="text-sm text-cs-ink3 leading-[1.75] mb-6 max-w-[380px]">
                  A 2-of-3 multi-oracle network reaches consensus and writes
                  your score to the{" "}
                  <code className="font-mono bg-cs-paper px-1.5 py-px rounded text-[13px]">
                    CreditScoreOracle
                  </code>{" "}
                  contract. Any lending protocol reads it directly — no API key,
                  no intermediary.
                </p>
                <div className="flex gap-2.5 flex-wrap mb-6">
                  {[
                    { icon: "🔐", text: "2-of-3 oracle consensus" },
                    { icon: "📅", text: "7-day score TTL" },
                    { icon: "🌐", text: "5 chains live" },
                  ].map((s) => (
                    <span
                      key={s.text}
                      className="flex items-center gap-[7px] bg-cs-paper border-[1.5px] border-cs-border rounded-cs px-3.5 py-2 text-xs font-semibold text-cs-ink2"
                    >
                      <span>{s.icon}</span>
                      {s.text}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col gap-2 mb-6">
                  {[
                    { name: "Ethereum Mainnet", live: true },
                    { name: "Arbitrum One", live: true },
                    { name: "Base", live: true },
                    { name: "Optimism", live: false },
                  ].map((ch) => (
                    <div
                      key={ch.name}
                      className="flex items-center gap-3 bg-cs-paper border border-cs-border rounded-cs px-3.5 py-2.5"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${ch.live ? "bg-cs-green" : "bg-[#ccc]"}`}
                      />
                      <span className="text-xs font-semibold text-cs-ink flex-1">
                        {ch.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-cs ${
                          ch.live
                            ? "bg-cs-green/10 text-cs-green-d"
                            : "bg-[#f5f5f5] text-cs-ink4"
                        }`}
                      >
                        {ch.live ? "Live" : "Coming soon"}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 text-[13px] font-bold text-cs-green-d hover:gap-2.5 transition-all"
                >
                  Read oracle docs <span>→</span>
                </Link>
              </div>

              {/* Node */}
              <div className="hidden lg:flex items-center justify-center relative z-[2]">
                <span className="w-16 h-16 rounded-full bg-white border-2 border-[#e0e0e0] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,.06)]">
                  <svg
                    aria-hidden
                    className="w-7 h-7 text-cs-green"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              {/* Right — Solidity panel */}
              <div className="hidden lg:flex items-center pl-5">
                <div className="bg-cs-dark rounded-[16px] p-[22px] w-full max-w-[340px] font-mono text-[11.5px] leading-[1.9] text-white/55">
                  <p className="text-cs-green/60 mb-2.5 text-[10px] tracking-[.08em] uppercase">
                    // Solidity — read score on-chain
                  </p>
                  <p>
                    <span className="kw">interface</span>{" "}
                    <span className="jk">ICreditScoreOracle</span>{" "}
                    <span className="pun">{"{"}</span>
                  </p>
                  <p className="pl-4">
                    <span className="kw">function</span>{" "}
                    <span className="str">getScore</span>
                    <span className="pun">(</span>
                    <span className="kw">address</span> w
                    <span className="pun">)</span>
                  </p>
                  <p className="pl-4">
                    <span className="kw">external view returns</span>
                  </p>
                  <p className="pl-4">
                    <span className="pun">(</span>
                    <span className="kw">uint16</span> score,{" "}
                    <span className="kw">bool</span> valid
                    <span className="pun">);</span>
                  </p>
                  <p>
                    <span className="pun">{"}"}</span>
                  </p>
                  <p className="mt-2.5">
                    <span className="kw">require</span>
                    <span className="pun">(</span>valid{" "}
                    <span className="pun">&amp;&amp;</span>
                  </p>
                  <p className="pl-4">
                    score <span className="pun">&gt;=</span>{" "}
                    <span className="num">580</span>
                    <span className="pun">,</span>
                  </p>
                  <p className="pl-4">
                    <span className="str">&quot;score too low&quot;</span>
                    <span className="pun">);</span>
                  </p>
                  <p className="mt-3 pt-2.5 border-t border-white/[.07] text-cs-green/50 text-[10px]">
                    ▶ No API key &middot; fully trustless
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="features" className="bg-cs-paper py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 sm:mb-14 reveal">
            <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
              Why ZentraScore
            </span>
            <h2 className="text-[clamp(26px,3.5vw,44px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.5px] leading-[1.08] mb-3.5 mx-auto">
              The most reliable crypto credit score for DeFi
            </h2>
            <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[520px] mx-auto">
              Every factor in your on-chain credit score is computed from
              immutable blockchain data. No surveys, no documents, no
              intermediaries.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border-[1.5px] border-cs-border rounded-[18px] p-8 px-7 transition hover:border-cs-green/35 hover:shadow-[0_8px_32px_rgba(0,201,141,.1)] hover:-translate-y-[3px]"
              >
                <div
                  className="w-[54px] h-[54px] rounded-[16px] flex items-center justify-center text-2xl mb-5"
                  style={{ background: f.bg }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-cs-ink mb-2.5 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[13.5px] text-cs-ink3 leading-[1.65]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BALANCE / DARK SECTION ────────────────────── */}
      <section className="bg-cs-dark px-4 sm:px-6 lg:px-14 py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
        <div className="reveal">
          <span className="inline-block text-xs font-bold tracking-[.08em] uppercase text-cs-green bg-cs-green/10 px-3.5 py-1 rounded-full mb-5">
            Live Dashboard
          </span>
          <h2 className="text-[clamp(30px,3.5vw,46px)] font-extrabold text-white tracking-[-1.5px] leading-[1.1] mb-[18px]">
            Easy Way To See
            <br />
            Your Total{" "}
            <em className="not-italic text-cs-green">Balance</em>
            <br />
            &amp; Score Health
          </h2>
          <p className="text-[15px] text-white/50 leading-[1.75] mb-8 max-w-[440px]">
            A real-time view of your on-chain credit position, active loans,
            best available rates, and personalised improvement actions — all in
            one place.
          </p>
          <div className="flex flex-col gap-[18px] mb-9">
            {[
              {
                title: "Real-time score tracking",
                desc: "Updates automatically on every on-chain event across all monitored protocols and chains.",
              },
              {
                title: "Loan eligibility previews",
                desc: "See which protocols you qualify for and at what rate, before you ever submit a transaction.",
              },
              {
                title: "Actionable recommendations",
                desc: "Specific steps ranked by score impact so you always know the highest-leverage action to take next.",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3.5">
                <span className="w-5 h-5 rounded-full bg-cs-green/15 flex items-center justify-center shrink-0 mt-px text-[10px] font-extrabold text-cs-green">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">
                    {f.title}
                  </p>
                  <p className="text-[13px] text-white/50 leading-[1.55]">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/sign-up"
            className="text-[15px] font-bold px-7 py-3 rounded-cs bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,201,141,.4)] inline-flex items-center gap-2"
          >
            Get Started &rarr;
          </Link>
        </div>

        {/* Mock dashboard */}
        <div className="reveal">
          <div className="bg-white/[.05] border border-white/10 rounded-[22px] p-6 shadow-cs-xl">
            <div className="flex justify-between items-center mb-[18px]">
              <span className="text-sm font-semibold text-white/90">
                Portfolio overview
              </span>
              <span className="text-[10px] font-semibold bg-cs-green/15 text-cs-green px-2 py-0.5 rounded-cs">
                This month
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/[.04] rounded-[14px] p-4 mb-4">
              <span className="text-[42px] font-extrabold text-white tracking-[-2px]">
                734
              </span>
              <div>
                <span className="text-[11px] font-bold text-cs-green bg-cs-green/[.12] px-2 py-0.5 rounded-md inline-block mb-1">
                  Good standing
                </span>
                <p className="text-xs text-white/40">
                  7.2% best APR available
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  icon: "🔵",
                  bg: "rgba(26,75,255,.15)",
                  name: "Aave V3 USDC Loan",
                  val: "-$12,500",
                  neg: true,
                },
                {
                  icon: "🟢",
                  bg: "rgba(0,201,141,.15)",
                  name: "Compound Repayment",
                  val: "+$5,000",
                  neg: false,
                },
                {
                  icon: "🔶",
                  bg: "rgba(255,107,43,.15)",
                  name: "MakerDAO CDP",
                  val: "-$8,200",
                  neg: true,
                },
                {
                  icon: "🦄",
                  bg: "rgba(139,92,246,.15)",
                  name: "Uniswap LP Position",
                  val: "+$3,450",
                  neg: false,
                },
              ].map((r) => (
                <div
                  key={r.name}
                  className="flex items-center gap-3 bg-white/[.03] rounded-[11px] px-3.5 py-2.5"
                >
                  <span
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center text-sm shrink-0"
                    style={{ background: r.bg }}
                  >
                    {r.icon}
                  </span>
                  <span className="text-[13px] text-white/70 flex-1 font-medium">
                    {r.name}
                  </span>
                  <span
                    className={`text-[13px] font-bold ${r.neg ? "text-[#ff7272]" : "text-cs-green"}`}
                  >
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3.5 mt-2 border-t border-white/[.06]">
              <span className="text-xs text-white/[.38]">Total balance</span>
              <span className="text-lg font-extrabold text-white tracking-tight">
                $40,659.00
              </span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── HANDOFF / SCORE DETAIL ────────────────────── */}
      <section className="bg-white px-4 sm:px-6 lg:px-14 py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 lg:gap-20 items-center">
        <div className="reveal">
          <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
            Score Intelligence
          </span>
          <h2 className="text-[clamp(28px,3.5vw,44px)] font-extrabold text-cs-ink tracking-[-1.5px] leading-[1.08] mb-3.5">
            Handoff Your Work
            <br />
            <em className="not-italic text-cs-green-d">Smarter</em> Now
          </h2>
          <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[480px] mb-8">
            Create a full on-chain credit profile for your wallet and share it
            directly with any lending protocol or counterparty — no intermediary
            required.
          </p>
          <div className="flex flex-col gap-[18px] mb-8">
            <div className="flex items-start gap-3.5">
              <span className="w-5 h-5 rounded-full bg-[rgba(26,75,255,.12)] flex items-center justify-center shrink-0 text-[10px] font-extrabold text-[#1a4bff]">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-cs-ink mb-0.5">
                  Strategic scoring
                </p>
                <p className="text-[13px] text-cs-ink3 leading-[1.55]">
                  Understand which factors move your score the most and by how
                  much — ranked by weighted contribution.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <span className="w-5 h-5 rounded-full bg-red-500/[.12] flex items-center justify-center shrink-0 text-[10px] font-extrabold text-red-500">
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-cs-ink mb-0.5">
                  Work schedule visibility
                </p>
                <p className="text-[13px] text-cs-ink3 leading-[1.55]">
                  See your complete DeFi activity timeline — when loans were
                  opened, repaid, or liquidated.
                </p>
              </div>
            </div>
          </div>
          <Link
            href="/sign-up"
            className="text-[15px] font-bold px-7 py-3 rounded-cs bg-cs-dark text-white transition hover:bg-[#1a4bff] inline-flex items-center gap-2"
          >
            Get Started &rarr;
          </Link>
        </div>

        {/* Score breakdown panel */}
        <div className="bg-cs-paper rounded-[22px] p-8 border-[1.5px] border-cs-border reveal">
          <p className="text-[13px] font-semibold text-cs-ink3 uppercase tracking-[.06em] mb-[18px]">
            Score factor breakdown
          </p>
          <div className="mb-6">
            {[
              { name: "Repayment history", v: 84, c: "#00c98d" },
              { name: "Liquidation record", v: 90, c: "#00c98d" },
              { name: "Wallet age", v: 55, c: "#ff6b2b" },
              { name: "Asset diversity", v: 62, c: "#ff6b2b" },
              { name: "Protocol breadth", v: 73, c: "#00c98d" },
              { name: "Stability", v: 48, c: "#e53e3e" },
            ].map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2.5 mb-2.5"
              >
                <span className="text-[13px] text-cs-ink2 w-[120px] shrink-0 font-medium">
                  {f.name}
                </span>
                <div className="flex-1 h-1.5 bg-[#ebebeb] rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${f.v}%`,
                      background: f.c,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-cs-ink w-9 text-right">
                  {f.v}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="flex items-start gap-2.5 py-3 border-b border-cs-border">
              <span className="w-7 h-7 rounded-lg bg-[#e8f5e9] flex items-center justify-center text-[13px] shrink-0 mt-px">
                🔵
              </span>
              <div>
                <p className="text-[13px] font-bold text-cs-ink mb-0.5">
                  Strategic recommendations
                </p>
                <p className="text-xs text-cs-ink3 leading-[1.5]">
                  Repay Aave USDC loan → estimated +18 pts
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 py-3">
              <span className="w-7 h-7 rounded-lg bg-[#fce4ec] flex items-center justify-center text-[13px] shrink-0 mt-px">
                📅
              </span>
              <div>
                <p className="text-[13px] font-bold text-cs-ink mb-0.5">
                  Activity timeline
                </p>
                <p className="text-xs text-cs-ink3 leading-[1.5]">
                  Last event: Compound repayment — 2 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────── */}
      <section id="pricing" className="bg-cs-paper py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 sm:mb-14 reveal">
            <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
              Pricing
            </span>
            <h2 className="text-[clamp(26px,3.5vw,44px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.5px] leading-[1.08] mb-3.5 mx-auto">
              Crypto credit score pricing.
              <br />
              Serious infrastructure.
            </h2>
            <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[480px] mx-auto">
              Start free. Scale as your protocol grows. No hidden fees, no
              per-chain surcharges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start reveal">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[20px] p-6 md:p-8 lg:p-9 lg:px-8 transition ${
                  plan.featured
                    ? "bg-cs-dark text-white md:col-span-2 lg:col-span-1 lg:scale-[1.03] shadow-cs-xl"
                    : "bg-white border-[1.5px] border-cs-border hover:shadow-cs-md"
                }`}
              >
                <span
                  className="text-[11px] font-bold tracking-[.06em] uppercase block mb-[18px]"
                  style={{ color: plan.tagColor }}
                >
                  {plan.tag}
                </span>
                <h3
                  className={`text-[22px] font-extrabold tracking-tight mb-2 ${plan.featured ? "text-white" : "text-cs-ink"}`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-[13px] leading-[1.6] mb-6 ${plan.featured ? "text-white/50" : "text-cs-ink3"}`}
                >
                  {plan.desc}
                </p>
                <p
                  className={`text-[52px] font-extrabold tracking-[-2.5px] leading-none mb-1 ${plan.featured ? "text-white" : "text-cs-ink"}`}
                >
                  {plan.price}
                </p>
                <p
                  className={`text-xs mb-7 ${plan.featured ? "text-white/40" : "text-cs-ink4"}`}
                >
                  {plan.period}
                </p>
                <ul className="flex flex-col gap-2.5 mb-7 list-none">
                  {plan.feats.map((feat) => (
                    <li
                      key={feat}
                      className={`text-[13.5px] flex gap-2.5 items-start ${plan.featured ? "text-white/70" : "text-cs-ink2"}`}
                    >
                      <span
                        className={`font-extrabold shrink-0 ${plan.featured ? "text-cs-green" : "text-cs-green-d"}`}
                      >
                        ✓
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`block w-full text-center py-3 rounded-cs text-sm font-bold transition ${plan.btnClass}`}
                >
                  {plan.btnText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-14">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12 sm:mb-14 reveal">
            <h2 className="text-[clamp(26px,3.5vw,44px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.5px] leading-[1.08] mb-2.5 mx-auto">
              What DeFi users and protocols say
              <br />
              about the ZentraScore crypto credit score
            </h2>
            <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[520px] mx-auto">
              Trusted by 18+ protocols and thousands of DeFi users worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 reveal">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white border-[1.5px] border-cs-border rounded-[18px] p-7 transition hover:shadow-cs-md hover:border-cs-green/20"
              >
                <p className="text-[#f5a623] text-sm tracking-[2px] mb-4">
                  {"★".repeat(t.stars)}
                  {t.stars < 5 && "☆"}
                </p>
                <h4 className="text-[15px] font-bold text-cs-ink mb-2.5 leading-[1.45] tracking-tight">
                  {t.title}
                </h4>
                <p className="text-[13.5px] text-cs-ink3 leading-[1.7] mb-5">
                  {t.body}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-cs-ink">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-cs-ink4 mt-px">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" className="bg-cs-paper py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-14">
        <div className="max-w-[820px] mx-auto">
          <div className="text-center mb-10 sm:mb-12 reveal">
            <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-[clamp(24px,3.5vw,40px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.5px] leading-[1.08] mb-3.5">
              Crypto credit score, answered
            </h2>
            <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[560px] mx-auto">
              Everything you need to know about how a cryptocurrency credit
              score works, how it&apos;s calculated, and how DeFi protocols use
              it.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:gap-4 reveal">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white border-[1.5px] border-cs-border rounded-[14px] open:shadow-cs-sm open:border-cs-green/30 transition"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-[15px] sm:text-base font-bold text-cs-ink leading-snug">
                    {faq.q}
                  </h3>
                  <span className="shrink-0 w-7 h-7 rounded-full bg-cs-paper border border-cs-border flex items-center justify-center text-cs-ink2 text-lg font-bold group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 -mt-1 text-[14px] text-cs-ink3 leading-[1.75]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────── */}
      <section className="bg-white border-t border-cs-border py-16 sm:py-20 px-4 sm:px-6 lg:px-14 text-center">
        <div className="max-w-[560px] mx-auto reveal">
          <span className="text-[44px] block mb-[18px]">📬</span>
          <h2 className="text-[clamp(24px,3vw,38px)] font-extrabold text-cs-ink tracking-[-1px] sm:tracking-[-1.2px] mb-3">
            Subscribe to our newsletter
          </h2>
          <p className="text-sm text-cs-ink3 mb-7 leading-[1.7]">
            Get weekly updates on DeFi credit markets, crypto credit score
            methodology changes, and new protocol integrations delivered to
            your inbox.
          </p>
          <div className="flex gap-2.5 justify-center max-w-[440px] mx-auto flex-col sm:flex-row">
            <input
              type="email"
              placeholder="your email address"
              className="flex-1 border-[1.5px] border-cs-border rounded-cs px-4 py-3 text-sm outline-none text-cs-ink focus:border-cs-green transition placeholder:text-cs-ink4"
            />
            <button className="bg-cs-green text-white text-sm font-bold border-none px-6 py-3 rounded-cs cursor-pointer hover:bg-cs-green-d transition whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="bg-gradient-to-br from-cs-dark to-cs-dark2 py-16 sm:py-20 px-4 sm:px-6 lg:px-14 text-center relative overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(0,201,141,.12),transparent_65%)] pointer-events-none" />
        <div className="max-w-[760px] mx-auto relative z-[1]">
          <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
            Ready to get started?
          </span>
          <h2 className="text-[clamp(26px,4vw,52px)] font-extrabold text-white tracking-[-1px] sm:tracking-[-1.5px] leading-[1.1] mb-4">
            Unlock undercollateralized lending with
            <br className="hidden sm:inline" />
            {" "}your on-chain crypto credit score
          </h2>
          <p className="text-[15px] text-white/50 leading-[1.75] max-w-[520px] mx-auto mb-9">
            Join 18+ protocols already using ZentraScore&apos;s cryptocurrency
            credit score to price risk, reduce defaults, and reward good
            borrowers with better rates.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/sign-up"
              className="text-[15px] font-bold px-8 py-3.5 rounded-cs bg-cs-green text-white transition hover:bg-cs-green-d hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,201,141,.4)] inline-flex items-center gap-2"
            >
              Get started free &rarr;
            </Link>
            <Link
              href="/docs"
              className="text-[15px] font-semibold px-7 py-3.5 rounded-cs bg-transparent text-white/80 border-[1.5px] border-white/[.18] hover:border-white/45 hover:text-white hover:bg-white/[.06] transition"
            >
              View API docs
            </Link>
          </div>
          <div className="mt-9 flex gap-8 justify-center flex-wrap">
            {[
              "Free 14-day trial",
              "No credit card required",
              "Setup in under 5 minutes",
            ].map((item) => (
              <span
                key={item}
                className="text-[13px] text-white/40 flex items-center gap-[7px]"
              >
                <span className="text-cs-green">✓</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
