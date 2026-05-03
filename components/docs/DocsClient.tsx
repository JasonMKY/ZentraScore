"use client";

import { useState, useRef, useEffect } from "react";

/* ── DATA ── */
interface SidebarItem {
  id: string;
  text: string;
  method?: string;
}

const sidebarGroups: { label: string; items: SidebarItem[] }[] = [
  {
    label: "Overview",
    items: [
      { id: "d-intro", text: "Introduction" },
      { id: "d-quickstart", text: "Quick start" },
      { id: "d-auth", text: "Authentication" },
      { id: "d-errors", text: "Errors & rate limits" },
    ],
  },
  {
    label: "Scoring",
    items: [
      { id: "d-get-score", text: "Get score", method: "GET" },
      { id: "d-batch", text: "Batch score", method: "POST" },
      { id: "d-hist-ep", text: "Score history", method: "GET" },
      { id: "d-terms", text: "Loan terms", method: "GET" },
    ],
  },
  {
    label: "Webhooks",
    items: [
      { id: "d-wh-create", text: "Create webhook", method: "POST" },
      { id: "d-wh-list", text: "List webhooks", method: "GET" },
      { id: "d-wh-del", text: "Delete webhook", method: "DELETE" },
    ],
  },
  {
    label: "Oracle",
    items: [
      { id: "d-oracle", text: "Oracle status", method: "GET" },
      { id: "d-oracle-req", text: "Request update", method: "POST" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { id: "d-portfolio", text: "Portfolio risk", method: "POST" },
    ],
  },
];

function MethodTag({ m }: { m: string }) {
  const cls =
    m === "GET"
      ? "mt-get"
      : m === "POST"
        ? "mt-post"
        : "mt-del";
  return (
    <span
      className={`font-mono text-[9px] font-semibold px-[7px] py-[2px] rounded tracking-[.04em] shrink-0 ${cls}`}
    >
      {m}
    </span>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className="absolute top-3 right-3 font-mono text-[10px] bg-white/[.09] text-white/45 border border-white/10 rounded-[5px] px-2.5 py-[3px] cursor-pointer hover:bg-white/[.18] hover:text-white transition"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, id }: { code: string; id?: string }) {
  return (
    <div className="code-block" id={id}>
      <CopyBtn text={code.replace(/<[^>]*>/g, "")} />
      <pre dangerouslySetInnerHTML={{ __html: code }} />
    </div>
  );
}

function Endpoint({
  method,
  path,
  summary,
  children,
  defaultOpen = false,
}: {
  method: string;
  path: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const mcls =
    method === "GET"
      ? "bg-cs-green/10 text-cs-green-x"
      : method === "POST"
        ? "bg-[rgba(26,75,255,.1)] text-[#1a4bff]"
        : "bg-red-500/10 text-red-600";
  return (
    <div className="bg-white border-[1.5px] border-cs-border rounded-[14px] mb-3 overflow-hidden transition hover:shadow-[0_4px_20px_rgba(0,0,0,.07)]">
      <div
        className={`flex items-center gap-3 px-[22px] py-4 cursor-pointer transition ${open ? "border-b border-cs-border bg-[#fafff9]" : "hover:bg-[#f9fff9]"}`}
        onClick={() => setOpen(!open)}
      >
        <span
          className={`font-mono text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 tracking-[.03em] min-w-[48px] text-center ${mcls}`}
        >
          {method}
        </span>
        <span className="font-mono text-[13px] flex-1 text-cs-ink font-medium">
          {path}
        </span>
        <span className="text-xs text-cs-ink4 mr-1.5 hidden sm:inline">
          {summary}
        </span>
        <span
          className={`text-base text-cs-ink4 transition-transform duration-200 shrink-0 ${open ? "rotate-90 text-cs-green-d" : ""}`}
        >
          ›
        </span>
      </div>
      {open && (
        <div className="p-6 pt-7 animate-fade-in">{children}</div>
      )}
    </div>
  );
}

/* ── SANDBOX ── */
function Sandbox() {
  const [addr, setAddr] = useState(
    "0x71C7656EC7ab88b098defB751B7401B5f6d8973F"
  );
  const [resp, setResp] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResp("// Running request…");
    await new Promise((r) => setTimeout(r, 900));
    const demo = {
      address: addr,
      score: 734,
      grade: "Good",
      valid: true,
      updatedAt: new Date().toISOString(),
      factors: {
        repaymentHistory: { score: 84, weight: 0.35, contribution: 161 },
        liquidationRecord: { score: 90, weight: 0.2, contribution: 99 },
        walletAge: { score: 55, weight: 0.15, contribution: 45 },
        assetDiversity: { score: 62, weight: 0.15, contribution: 51 },
        protocolBreadth: { score: 73, weight: 0.1, contribution: 40 },
        portfolioStability: { score: 48, weight: 0.05, contribution: 13 },
      },
      loanTerms: {
        maxLtvBps: 8000,
        interestRateBps: 720,
        maxBorrowUsdc: 25000,
      },
      fraudFlags: [],
      ipfsCid: "bafybeig3w...",
    };
    setResp("// 200 OK\n" + JSON.stringify(demo, null, 2));
    setLoading(false);
  }

  return (
    <div className="bg-cs-dark rounded-[14px] p-[22px] mt-5 border border-white/[.06]">
      <p className="font-mono text-[10px] tracking-[.08em] uppercase text-white/30 mb-3">
        Live sandbox — paste any Ethereum address
      </p>
      <input
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        className="w-full bg-white/[.06] border border-white/[.12] rounded-lg px-3.5 py-2.5 font-mono text-xs text-white/85 outline-none focus:border-cs-green transition mb-3"
      />
      <button
        onClick={run}
        disabled={loading}
        className="bg-cs-green text-white text-xs font-bold border-none px-5 py-2 rounded-lg cursor-pointer hover:bg-cs-green-d hover:-translate-y-px transition inline-flex items-center gap-1.5"
      >
        ▶ Run request
      </button>
      {resp && (
        <div className="mt-3.5 bg-black/40 rounded-cs p-[18px] font-mono text-[11.5px] text-white/70 leading-[1.85] whitespace-pre-wrap max-h-[360px] overflow-y-auto border border-white/[.05] animate-fade-in">
          {resp}
        </div>
      )}
    </div>
  );
}

/* ── MAIN ── */
export default function DocsClient() {
  const [active, setActive] = useState("d-intro");
  const [search, setSearch] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  function scrollTo(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".docs-sec[id]");
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { threshold: 0.2, rootMargin: "-68px 0px -60% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const filteredGroups = sidebarGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((i) =>
        i.text.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <main className="pt-[68px]">
      <div className="grid grid-cols-1 lg:grid-cols-[248px_1fr] xl:grid-cols-[272px_1fr] min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col bg-cs-dark h-[calc(100vh-68px)] sticky top-[68px] overflow-y-auto scrollbar-thin">
          {/* Search */}
          <div className="px-5 py-5 pb-3.5 border-b border-white/[.07] mb-1.5">
            <div className="flex items-center gap-2 bg-white/[.06] border border-white/10 rounded-lg px-3 py-2 focus-within:border-cs-green transition">
              <span className="text-[13px] opacity-40">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search endpoints…"
                className="bg-transparent border-none outline-none text-xs text-white/70 w-full placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Version */}
          <div className="flex items-center justify-between px-5 py-2">
            <span className="text-[10px] font-bold tracking-[.06em] bg-cs-green/[.12] text-cs-green px-2 py-0.5 rounded-[20px]">
              v1 · stable
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-white/35">
              <span className="w-1.5 h-1.5 rounded-full bg-cs-green animate-pulse2" />
              All systems up
            </span>
          </div>

          {/* Nav groups */}
          <div className="flex-1 overflow-y-auto">
            {filteredGroups.map((g) => (
              <div key={g.label}>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[.1em] px-5 pt-4 pb-1">
                  {g.label}
                </p>
                {g.items.map((item) => (
                  <div
                    key={item.id}
                    className={`docs-link ${active === item.id ? "active" : ""}`}
                    onClick={() => scrollTo(item.id)}
                  >
                    {item.method && <MethodTag m={item.method} />}
                    {item.text}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto px-5 py-4 border-t border-white/[.07] flex gap-3.5">
            {["GitHub", "Changelog", "Status", "Support"].map((l) => (
              <span
                key={l}
                className="text-[11px] text-white/25 hover:text-white/65 cursor-pointer transition"
              >
                {l}
              </span>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="bg-white min-h-[calc(100vh-68px)] overflow-y-auto" ref={contentRef}>
          {/* Topbar */}
          <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-[52px] py-4 bg-white/95 border-b border-cs-border sticky top-[68px] z-[100] backdrop-blur-xl flex-wrap gap-3 sm:gap-4">
            <span className="text-[13px] text-cs-ink3 font-mono">
              API Reference{" "}
              <span className="text-cs-ink4 mx-1">/</span>{" "}
              <span className="text-cs-ink font-semibold">
                {sidebarGroups
                  .flatMap((g) => g.items)
                  .find((i) => i.id === active)?.text ?? "Introduction"}
              </span>
            </span>
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <select className="text-xs font-mono bg-cs-paper border-[1.5px] border-cs-border rounded-[7px] px-2.5 py-1.5 text-cs-ink2 outline-none">
                <option>Production</option>
                <option>Sandbox</option>
              </select>
              <input
                className="text-xs font-mono bg-cs-paper border-[1.5px] border-cs-border rounded-[7px] px-3 py-1.5 text-cs-ink2 flex-1 sm:flex-none sm:w-[200px] outline-none focus:border-cs-green transition"
                placeholder="cs_live_your_api_key…"
              />
            </div>
          </div>

          {/* Mobile section picker — sidebar is desktop-only, so expose nav here */}
          <div className="lg:hidden px-4 sm:px-6 pt-4 bg-white border-b border-cs-border">
            <label htmlFor="docs-section-picker" className="sr-only">
              Jump to section
            </label>
            <div className="relative">
              <select
                id="docs-section-picker"
                value={active}
                onChange={(e) => scrollTo(e.target.value)}
                className="w-full appearance-none bg-cs-paper border-[1.5px] border-cs-border rounded-[9px] px-3.5 py-2.5 pr-9 text-[13px] font-semibold text-cs-ink outline-none focus:border-cs-green transition mb-4"
              >
                {sidebarGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.method ? `${i.method} · ${i.text}` : i.text}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-[calc(50%+8px)] text-cs-ink3 text-sm">
                ▾
              </span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="px-4 sm:px-6 md:px-10 lg:px-[52px] py-10 sm:py-12 lg:py-[52px] pb-16 sm:pb-20">
            {/* Intro */}
            <section className="docs-sec mb-16 scroll-mt-[136px]" id="d-intro">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Getting started
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5 leading-[1.08]">
                ZentraScore API v1
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-6">
                A REST API for on-chain credit scoring. Index wallet behaviour
                across 18+ DeFi protocols and expose credit scores directly to
                your lending contracts, risk systems, and user interfaces.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  {
                    label: "Base URL",
                    value: "https://api.zentrascore.io/v1",
                    green: true,
                  },
                  {
                    label: "Sandbox",
                    value: "https://sandbox.zentrascore.io/v1",
                    green: false,
                  },
                  {
                    label: "Response format",
                    value: "JSON · ISO 8601 timestamps · Native token units",
                    green: false,
                  },
                  {
                    label: "SDKs available",
                    value:
                      "@zentrascore/sdk (JS/TS) · zentrascore-py · go-zentrascore",
                    green: false,
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="bg-cs-paper border-[1.5px] border-cs-border rounded-xl p-4 hover:border-cs-green/30 transition"
                  >
                    <p className="text-[10px] font-bold text-cs-ink4 uppercase tracking-[.06em] mb-[7px] font-mono">
                      {c.label}
                    </p>
                    <p
                      className={`text-xs ${c.green ? "font-mono text-cs-green-d" : "text-cs-ink2"}`}
                    >
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5 p-3.5 rounded-cs border border-cs-green/20 bg-cs-green/[.05] text-[13px] text-cs-ink2 leading-[1.6]">
                <span>✓</span>
                <span>
                  All endpoints are available on both production and sandbox.
                  Sandbox scores are deterministic — the same address always
                  returns the same score for testing.
                </span>
              </div>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Quick start */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-quickstart"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Quick start
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Up in 5 minutes
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-7">
                Install the SDK, paste your API key, and make your first score
                request — that&apos;s it.
              </p>
              <div className="flex flex-col gap-3 mb-7">
                {[
                  {
                    n: "1",
                    title: "Install the SDK",
                    cmd: "npm install @zentrascore/sdk",
                  },
                  {
                    n: "2",
                    title: "Set your API key",
                    cmd: "ZENTRASCORE_API_KEY=cs_live_xxxx",
                  },
                  {
                    n: "3",
                    title: "Make your first request",
                    cmd: "client.score.get('0x...')",
                  },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="flex items-center gap-3.5 bg-cs-paper border-[1.5px] border-cs-border rounded-xl px-5 py-4"
                  >
                    <span className="w-7 h-7 rounded-full bg-cs-green flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                      {s.n}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-cs-ink mb-0.5">
                        {s.title}
                      </p>
                      <p className="font-mono text-xs text-cs-ink3">{s.cmd}</p>
                    </div>
                  </div>
                ))}
              </div>
              <CodeBlock
                code={`<span class="cm"># Install the JavaScript / TypeScript SDK</span>
npm install @zentrascore/sdk

<span class="cm"># Add your key to .env</span>
ZENTRASCORE_API_KEY=cs_live_xxxxxxxxxxxx

<span class="cm"># Make your first call</span>
<span class="kw">import</span> ZentraScore <span class="kw">from</span> <span class="str">'@zentrascore/sdk'</span>;
<span class="kw">const</span> cs = <span class="kw">new</span> ZentraScore({ apiKey: process.env.ZENTRASCORE_API_KEY });
<span class="kw">const</span> result = <span class="kw">await</span> cs.score.get(<span class="str">'0x71C7...'</span>);
console.log(result.score); <span class="cm">// 734</span>`}
              />
            </section>

            <hr className="border-cs-border my-12" />

            {/* Auth */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-auth"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Authentication
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                API Keys
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-5">
                Most API endpoints require a Bearer token in the{" "}
                <code className="font-mono bg-[#f3f5f3] px-1.5 py-px rounded text-xs text-cs-green-x">
                  Authorization
                </code>{" "}
                header. Keys are prefixed with{" "}
                <code className="font-mono bg-[#f3f5f3] px-1.5 py-px rounded text-xs text-cs-green-x">
                  cs_live_
                </code>{" "}
                for production and{" "}
                <code className="font-mono bg-[#f3f5f3] px-1.5 py-px rounded text-xs text-cs-green-x">
                  cs_test_
                </code>{" "}
                for sandbox.
              </p>
              <p className="text-[13px] text-cs-ink3 leading-[1.65] mb-5">
                Generate and manage API keys from{" "}
                <code className="font-mono bg-[#f3f5f3] px-1.5 py-px rounded text-xs text-cs-green-x">
                  /api/api-keys
                </code>{" "}
                (Protocol API and Risk Analytics plans).
              </p>
              <div className="flex gap-2.5 p-3.5 rounded-cs border border-[rgba(255,107,43,.2)] bg-[rgba(255,107,43,.05)] text-[13px] text-cs-ink2 leading-[1.6] mb-5">
                <span>⚠</span>
                <span>
                  Never expose API keys in client-side code. For browser apps,
                  proxy requests through your backend. For smart contracts, use
                  the on-chain oracle directly.
                </span>
              </div>
              <CodeBlock
                code={`<span class="kw">curl</span> https://api.zentrascore.io/v1/score/0x71C7...
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>`}
              />
            </section>

            <hr className="border-cs-border my-12" />

            {/* Errors */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-errors"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Errors &amp; Limits
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Errors &amp; Rate Limits
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-6">
                ZentraScore uses conventional HTTP status codes. Errors include
                a machine-readable code and a human-readable message.
              </p>
              <table className="loan-table mb-7">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Meaning</th>
                    <th>Common cause</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      code: "200",
                      cls: "badge-green",
                      m: "Success",
                      c: "Request completed normally",
                    },
                    {
                      code: "400",
                      cls: "badge-amber",
                      m: "Bad request",
                      c: "Missing or invalid parameter",
                    },
                    {
                      code: "401",
                      cls: "badge-red",
                      m: "Unauthorized",
                      c: "Invalid or missing API key",
                    },
                    {
                      code: "404",
                      cls: "bg-[#f5f5f5] text-cs-ink3",
                      m: "Not found",
                      c: "Wallet has no scoring history",
                    },
                    {
                      code: "429",
                      cls: "badge-amber",
                      m: "Rate limited",
                      c: "Check X-RateLimit-Reset header",
                    },
                  ].map((r) => (
                    <tr key={r.code}>
                      <td>
                        <span className={`badge ${r.cls}`}>{r.code}</span>
                      </td>
                      <td className="font-semibold text-cs-ink">{r.m}</td>
                      <td className="text-[13px] text-cs-ink3">{r.c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="text-sm font-bold text-cs-ink mb-3">
                Rate limits by plan
              </p>
              <table className="loan-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Requests / min</th>
                    <th>Batch size</th>
                    <th>Daily queries</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Consumer", "10", "—", "100"],
                    ["Protocol API", "300", "500", "50,000"],
                    ["Analytics", "60", "1,000", "10,000"],
                    ["Enterprise", "Custom", "Custom", "Unlimited"],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td className="font-semibold">{r[0]}</td>
                      <td>{r[1]}</td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Get Score */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-get-score"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Scoring
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Get score
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-6">
                Retrieve the current credit score and full factor breakdown for
                a wallet address. Scores are cached for 1 hour; pass{" "}
                <code className="font-mono bg-[#f3f5f3] px-1.5 py-px rounded text-xs text-cs-green-x">
                  fresh=true
                </code>{" "}
                to force recomputation.
              </p>

              <Endpoint
                method="GET"
                path="/score/{address}"
                summary="Get wallet credit score"
                defaultOpen
              >
                <p className="text-[13.5px] text-cs-ink2 leading-[1.7] mb-5">
                  Returns the ZentraScore for a given Ethereum address. If the
                  wallet has no history or fails hard gates (age &lt; 180 days),
                  returns 404.
                </p>

                <p className="text-xs font-bold text-cs-ink uppercase tracking-[.05em] font-mono mb-2.5">
                  Path parameters
                </p>
                <table className="loan-table mb-5">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-[13px] text-cs-ink font-medium">
                        address
                      </td>
                      <td>
                        <span className="font-mono text-[10px] text-cs-green-x bg-cs-green/[.08] px-[7px] py-[2px] rounded">
                          string
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-[10px] text-red-600 bg-red-500/[.07] px-[7px] py-[2px] rounded">
                          required
                        </span>
                      </td>
                      <td className="text-[13px] text-cs-ink2">
                        Checksummed Ethereum address (EIP-55)
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-xs font-bold text-cs-ink uppercase tracking-[.05em] font-mono mb-2.5 mt-4">
                  Query parameters
                </p>
                <table className="loan-table mb-5">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Required</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["fresh", "boolean", "optional", "Force recomputation, costs 5× query credit"],
                      ["include_history", "boolean", "optional", "Include 12-month score history in response"],
                      ["chains", "string[]", "optional", "Chain IDs to include. Default: 1,42161,8453"],
                    ].map((r) => (
                      <tr key={r[0]}>
                        <td className="font-mono text-[13px] text-cs-ink font-medium">
                          {r[0]}
                        </td>
                        <td>
                          <span className="font-mono text-[10px] text-cs-green-x bg-cs-green/[.08] px-[7px] py-[2px] rounded">
                            {r[1]}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-[10px] text-cs-ink4 bg-[#f3f3f3] px-[7px] py-[2px] rounded">
                            {r[2]}
                          </span>
                        </td>
                        <td className="text-[13px] text-cs-ink2">{r[3]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <CodeBlock
                  code={`<span class="kw">curl</span> -G https://api.zentrascore.io/v1/score/0x71C7656EC7ab88b098defB751B7401B5f6d8973F
  -d fresh=false -d include_history=true
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>`}
                />

                <p className="text-[11px] font-bold text-cs-ink3 uppercase tracking-[.06em] font-mono mt-5 mb-2 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-cs-border">
                  Example response
                </p>
                <CodeBlock
                  code={`<span class="pun">{</span>
  <span class="jk">"address"</span>: <span class="str">"0x71C7656EC7ab88b098defB751B7401B5f6d8973F"</span>,
  <span class="jk">"score"</span>: <span class="num">734</span>,
  <span class="jk">"grade"</span>: <span class="str">"Good"</span>,
  <span class="jk">"valid"</span>: <span class="kw">true</span>,
  <span class="jk">"factors"</span>: <span class="pun">{</span>
    <span class="jk">"repaymentHistory"</span>:  <span class="pun">{</span> <span class="jk">"score"</span>: <span class="num">84</span>, <span class="jk">"weight"</span>: <span class="num">0.35</span> <span class="pun">},</span>
    <span class="jk">"liquidationRecord"</span>: <span class="pun">{</span> <span class="jk">"score"</span>: <span class="num">90</span>, <span class="jk">"weight"</span>: <span class="num">0.20</span> <span class="pun">},</span>
    <span class="jk">"walletAge"</span>:          <span class="pun">{</span> <span class="jk">"score"</span>: <span class="num">55</span>, <span class="jk">"weight"</span>: <span class="num">0.15</span> <span class="pun">}</span>
  <span class="pun">},</span>
  <span class="jk">"loanTerms"</span>: <span class="pun">{</span> <span class="jk">"maxLtvBps"</span>: <span class="num">8000</span>, <span class="jk">"interestRateBps"</span>: <span class="num">720</span> <span class="pun">}</span>
<span class="pun">}</span>`}
                />

                <Sandbox />
              </Endpoint>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Batch */}
            <section
              className="docs-sec mb-8 scroll-mt-[136px]"
              id="d-batch"
            >
              <Endpoint
                method="POST"
                path="/score/batch"
                summary="Score up to 500 wallets at once"
              >
                <p className="text-[13.5px] text-cs-ink2 leading-[1.7] mb-5">
                  Submit up to 500 wallet addresses in a single request. Scores
                  are computed in parallel and returned in input order.
                </p>
                <CodeBlock
                  code={`<span class="kw">curl</span> -X POST https://api.zentrascore.io/v1/score/batch
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>
  -H <span class="str">"Content-Type: application/json"</span>
  -d <span class="str">'{"addresses":["0x71C7...","0xAbCd..."],"fresh":false}'</span>`}
                />
              </Endpoint>
            </section>

            {/* History */}
            <section
              className="docs-sec mb-8 scroll-mt-[136px]"
              id="d-hist-ep"
            >
              <Endpoint
                method="GET"
                path="/score/{address}/history"
                summary="12-month score history"
              >
                <p className="text-[13.5px] text-cs-ink2 leading-[1.7] mb-5">
                  Returns month-by-month score snapshots for the past 12 months.
                </p>
                <CodeBlock
                  code={`<span class="kw">curl</span> https://api.zentrascore.io/v1/score/0x71C7.../history
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>`}
                />
              </Endpoint>
            </section>

            {/* Loan terms */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-terms"
            >
              <Endpoint
                method="GET"
                path="/score/{address}/loan-terms"
                summary="Recommended loan terms"
              >
                <p className="text-[13.5px] text-cs-ink2 leading-[1.7] mb-5">
                  Returns LTV ratio, interest rate, and max borrow limit derived
                  from the wallet&apos;s current score tier.
                </p>
                <CodeBlock
                  code={`<span class="pun">{</span>
  <span class="jk">"maxLtvBps"</span>: <span class="num">8000</span>,        <span class="cm">// 80% LTV</span>
  <span class="jk">"interestRateBps"</span>: <span class="num">720</span>,   <span class="cm">// 7.2% APR</span>
  <span class="jk">"maxBorrowUsdc"</span>: <span class="num">25000</span>,
  <span class="jk">"scoreBand"</span>: <span class="str">"Good"</span>,
  <span class="jk">"eligibleProtocols"</span>: [<span class="str">"aave-v3"</span>, <span class="str">"compound-v3"</span>]
<span class="pun">}</span>`}
                />
              </Endpoint>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Webhooks */}
            <section
              className="docs-sec mb-8 scroll-mt-[136px]"
              id="d-wh-create"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Webhooks
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Webhooks
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-5">
                Receive real-time POST requests when a wallet&apos;s score
                changes. Payloads are signed with HMAC-SHA256.
              </p>
              <Endpoint
                method="POST"
                path="/webhooks"
                summary="Register a webhook endpoint"
              >
                <CodeBlock
                  code={`<span class="kw">curl</span> -X POST https://api.zentrascore.io/v1/webhooks
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>
  -d <span class="str">'{"url":"https://your-protocol.xyz/hook","addresses":["0x71C7..."],"events":["score.updated"]}'</span>`}
                />
              </Endpoint>
            </section>

            <section
              className="docs-sec mb-8 scroll-mt-[136px]"
              id="d-wh-list"
            >
              <Endpoint
                method="GET"
                path="/webhooks"
                summary="List all webhooks"
              >
                <CodeBlock
                  code={`<span class="kw">curl</span> https://api.zentrascore.io/v1/webhooks
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>`}
                />
              </Endpoint>
            </section>

            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-wh-del"
            >
              <Endpoint
                method="DEL"
                path="/webhooks/{id}"
                summary="Delete a webhook"
              >
                <CodeBlock
                  code={`<span class="kw">curl</span> -X DELETE https://api.zentrascore.io/v1/webhooks/wh_xxxx
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>`}
                />
              </Endpoint>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Oracle */}
            <section
              className="docs-sec mb-8 scroll-mt-[136px]"
              id="d-oracle"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                On-chain Oracle
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Oracle
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-5">
                The on-chain oracle writes scores to the CreditScoreOracle
                contract on each supported chain. Smart contracts read scores
                directly — zero API cost, fully trustless.
              </p>
              <Endpoint
                method="GET"
                path="/oracle/status"
                summary="Network status and contract addresses"
              >
                <CodeBlock
                  code={`<span class="pun">{</span>
  <span class="jk">"status"</span>: <span class="str">"operational"</span>,
  <span class="jk">"oracleConsensus"</span>: <span class="str">"2/3"</span>,
  <span class="jk">"contracts"</span>: <span class="pun">{</span>
    <span class="jk">"1"</span>:     <span class="pun">{</span> <span class="jk">"oracle"</span>: <span class="str">"0xCSORA..."</span>, <span class="jk">"name"</span>: <span class="str">"Ethereum"</span>  <span class="pun">},</span>
    <span class="jk">"42161"</span>: <span class="pun">{</span> <span class="jk">"oracle"</span>: <span class="str">"0xCSORA..."</span>, <span class="jk">"name"</span>: <span class="str">"Arbitrum"</span> <span class="pun">},</span>
    <span class="jk">"8453"</span>:  <span class="pun">{</span> <span class="jk">"oracle"</span>: <span class="str">"0xCSORA..."</span>, <span class="jk">"name"</span>: <span class="str">"Base"</span>     <span class="pun">}</span>
  <span class="pun">}</span>
<span class="pun">}</span>`}
                />
              </Endpoint>
            </section>

            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-oracle-req"
            >
              <Endpoint
                method="POST"
                path="/oracle/update"
                summary="Request immediate on-chain update"
              >
                <p className="text-[13.5px] text-cs-ink2 leading-[1.7] mb-5">
                  Trigger an immediate oracle update instead of waiting for the
                  next scheduled refresh.
                </p>
                <div className="flex gap-2.5 p-3.5 rounded-cs border border-[rgba(255,107,43,.2)] bg-[rgba(255,107,43,.05)] text-[13px] text-cs-ink2 leading-[1.6] mb-5">
                  <span>⚠</span>
                  <span>
                    On-demand oracle updates consume 10× the query credit and
                    may take up to 2 minutes to confirm on-chain.
                  </span>
                </div>
                <CodeBlock
                  code={`<span class="kw">curl</span> -X POST https://api.zentrascore.io/v1/oracle/update
  -H <span class="str">"Authorization: Bearer cs_live_xxxxxxxxxxxx"</span>
  -d <span class="str">'{"address":"0x71C7...","chainId":1}'</span>`}
                />
              </Endpoint>
            </section>

            <hr className="border-cs-border my-12" />

            {/* Portfolio */}
            <section
              className="docs-sec mb-16 scroll-mt-[136px]"
              id="d-portfolio"
            >
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cs-green-d uppercase tracking-[.1em] mb-3 before:content-[''] before:w-3.5 before:h-0.5 before:bg-cs-green before:rounded-sm">
                Analytics
              </p>
              <h2 className="text-[32px] font-extrabold text-cs-ink tracking-[-1.2px] mb-3.5">
                Portfolio risk
              </h2>
              <p className="text-sm text-cs-ink2 leading-[1.75] max-w-[640px] mb-5">
                Aggregate risk metrics for a portfolio of borrowers. Available
                on Analytics and Enterprise plans.
              </p>
              <Endpoint
                method="POST"
                path="/analytics/portfolio"
                summary="Risk summary for a borrower portfolio"
              >
                <CodeBlock
                  code={`<span class="cm"># Request</span>
<span class="pun">{</span>
  <span class="jk">"positions"</span>: <span class="pun">[</span>
    <span class="pun">{</span> <span class="jk">"address"</span>: <span class="str">"0x71C7..."</span>, <span class="jk">"borrowedUsdc"</span>: <span class="num">25000</span> <span class="pun">},</span>
    <span class="pun">{</span> <span class="jk">"address"</span>: <span class="str">"0xAbCd..."</span>, <span class="jk">"borrowedUsdc"</span>: <span class="num">8000</span>  <span class="pun">}</span>
  <span class="pun">]</span>
<span class="pun">}</span>

<span class="cm"># Response</span>
<span class="pun">{</span>
  <span class="jk">"totalExposureUsdc"</span>: <span class="num">33000</span>,
  <span class="jk">"weightedAverageScore"</span>: <span class="num">718</span>,
  <span class="jk">"expectedDefaultRateBps"</span>: <span class="num">142</span>,
  <span class="jk">"expectedLossUsdc"</span>: <span class="num">469</span>
<span class="pun">}</span>`}
                />
              </Endpoint>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
