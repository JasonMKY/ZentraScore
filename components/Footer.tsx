import Link from "next/link";

const footerCols = [
  {
    title: "Services",
    links: [
      { label: "Consumer Score", href: "/pricing" },
      { label: "Protocol API", href: "/docs" },
      { label: "Risk Analytics", href: "/pricing" },
      { label: "On-chain Oracle", href: "/docs" },
      { label: "Webhooks", href: "/docs" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "API Docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Sign Up", href: "/sign-up" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-cs-dark pt-16 pb-9 px-6 lg:px-14">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr_1fr] gap-12 pb-12 border-b border-white/[.07] mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-xl font-extrabold text-white mb-3.5">
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-cs-green">
                <svg
                  viewBox="0 0 14 14"
                  className="h-[13px] w-[13px] fill-white"
                >
                  <path d="M7 0L14 3.5V10.5L7 14L0 10.5V3.5Z" />
                </svg>
              </span>
              <span>
                Zentra<span className="text-cs-green">Score</span>
              </span>
            </div>
            <p className="text-[13px] text-white/[.38] leading-[1.75] max-w-[260px] mb-5">
              The first on-chain credit scoring infrastructure for DeFi. Built
              for protocols. Trusted by users. Verified by the chain.
            </p>
            <div className="flex gap-2">
              {["𝕏", "💬", "⌥", "in"].map((icon) => (
                <span
                  key={icon}
                  className="w-[34px] h-[34px] rounded-[9px] bg-white/[.06] border border-white/[.08] flex items-center justify-center text-sm text-white/50 hover:bg-white/[.12] hover:text-white hover:border-white/20 transition cursor-pointer font-bold"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>

          {/* Columns */}
          {footerCols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-[.08em] mb-4">
                {col.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-[13px] text-white/[.38] hover:text-white/[.85] transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3">
          <span className="text-xs text-white/[.22] font-mono">
            &copy; {new Date().getFullYear()} ZentraScore &middot; All rights
            reserved
          </span>
          <div className="flex gap-5">
            <Link
              href="#"
              className="text-xs text-white/[.22] hover:text-white/60 transition"
            >
              Terms &amp; Service
            </Link>
            <Link
              href="#"
              className="text-xs text-white/[.22] hover:text-white/60 transition"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
