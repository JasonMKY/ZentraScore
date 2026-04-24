import Footer from "@/components/Footer";
import CheckoutButton from "@/components/pricing/CheckoutButton";

type PlanId = "CONSUMER" | "PROTOCOL" | "ANALYTICS";

const plans: {
  id: PlanId;
  tag: string;
  tagColor: string;
  name: string;
  desc: string;
  price: string;
  period: string;
  feats: string[];
  btnClass: string;
  btnText: string;
  featured: boolean;
}[] = [
  {
    id: "CONSUMER",
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
    id: "PROTOCOL",
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
      "Dedicated Slack support",
    ],
    btnClass:
      "bg-cs-green text-white hover:bg-cs-green-d hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,201,141,.35)]",
    btnText: "Start Protocol API",
    featured: true,
  },
  {
    id: "ANALYTICS",
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
    btnText: "Get started",
    featured: false,
  },
];

const comparisons = [
  { feat: "Score lookups / day", c: "100", p: "50,000", e: "10,000" },
  { feat: "Score history", c: "12 months", p: "Full", e: "Full" },
  { feat: "Factor breakdown", c: "✓", p: "✓", e: "✓" },
  { feat: "REST API access", c: "—", p: "✓", e: "✓" },
  { feat: "On-chain oracle", c: "—", p: "✓", e: "—" },
  { feat: "Batch scoring", c: "—", p: "500 / req", e: "1,000 / req" },
  { feat: "Webhooks", c: "—", p: "✓", e: "✓" },
  { feat: "Portfolio analytics", c: "—", p: "—", e: "✓" },
  { feat: "Custom weights", c: "—", p: "✓", e: "—" },
  { feat: "SLA", c: "—", p: "99.9%", e: "99.9%" },
  { feat: "Support", c: "Email", p: "Slack", e: "Slack + Priority" },
];

const faqs = [
  {
    q: "Is there a free tier?",
    a: "Yes — all plans include a 14-day free trial with full access to every feature. No credit card required.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Absolutely. Upgrade or downgrade at any point. We'll prorate the difference to your next billing cycle.",
  },
  {
    q: "What happens if I exceed rate limits?",
    a: "Requests over your plan's limit return 429. We'll notify you and suggest upgrading if you're consistently hitting the ceiling.",
  },
  {
    q: "Do you offer annual pricing?",
    a: "Yes — annual plans come with 2 months free. Contact sales for enterprise annual agreements.",
  },
  {
    q: "How do on-chain oracle fees work?",
    a: "Oracle updates are gas-paid by the protocol. ZentraScore does not charge gas on top of the plan price.",
  },
];

export default function PricingPage() {
  return (
    <main className="pt-[68px]">
      {/* Header */}
      <section className="bg-cs-paper py-24 px-6 lg:px-14 border-b border-cs-border">
        <div className="max-w-[1100px] mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-[.1em] uppercase text-cs-green-d bg-cs-green/[.08] px-3.5 py-1 rounded-full mb-4">
            Pricing
          </span>
          <h1 className="text-[clamp(32px,4vw,52px)] font-extrabold text-cs-ink tracking-[-1.5px] leading-[1.08] mb-4">
            Simple Pricing.
            <br />
            Serious Infrastructure.
          </h1>
          <p className="text-[15px] text-cs-ink3 leading-[1.75] max-w-[480px] mx-auto">
            Start free. Scale as your protocol grows. No hidden fees, no
            per-chain surcharges.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="bg-cs-paper pb-24 px-6 lg:px-14">
        <div className="max-w-[1100px] mx-auto -mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[20px] p-9 px-8 transition ${
                  plan.featured
                    ? "bg-cs-dark text-white lg:scale-[1.03] shadow-cs-xl"
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
                <CheckoutButton
                  plan={plan.id}
                  label={plan.btnText}
                  className={`block w-full text-center py-3 rounded-cs text-sm font-bold cursor-pointer border-none transition ${plan.btnClass}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-white py-24 px-6 lg:px-14 border-t border-cs-border">
        <div className="max-w-[900px] mx-auto">
          <h2 className="text-2xl font-extrabold text-cs-ink tracking-tight mb-8 text-center">
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="loan-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Feature</th>
                  <th className="text-center">Consumer</th>
                  <th className="text-center">Protocol API</th>
                  <th className="text-center">Risk Analytics</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.feat}>
                    <td className="font-medium text-cs-ink">{row.feat}</td>
                    <td className="text-center">{row.c}</td>
                    <td className="text-center font-semibold text-cs-green-d">
                      {row.p}
                    </td>
                    <td className="text-center">{row.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cs-paper py-24 px-6 lg:px-14">
        <div className="max-w-[700px] mx-auto">
          <h2 className="text-2xl font-extrabold text-cs-ink tracking-tight mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white border-[1.5px] border-cs-border rounded-[14px] p-5 px-6"
              >
                <h4 className="text-sm font-bold text-cs-ink mb-2">
                  {faq.q}
                </h4>
                <p className="text-[13px] text-cs-ink3 leading-[1.65]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
