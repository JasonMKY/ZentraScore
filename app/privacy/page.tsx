import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ZentraScore Privacy Policy — what data we collect, how we use it, and the choices you have.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const lastUpdated = "May 7, 2026";

export default function PrivacyPage() {
  return (
    <>
      <main className="pt-[68px] min-h-screen bg-cs-paper">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <p className="text-[11px] font-bold tracking-[.1em] uppercase text-cs-green-d mb-3">
            Legal
          </p>
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-cs-ink tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-[13px] text-cs-ink4 font-mono mb-10">
            Last updated: {lastUpdated}
          </p>

          <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6 sm:p-8 lg:p-10 shadow-cs-sm space-y-8 text-[15px] leading-relaxed text-cs-ink2">
            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                1. Overview
              </h2>
              <p>
                This Privacy Policy explains how ZentraScore (&quot;we&quot;,
                &quot;us&quot;) collects, uses, and shares information when
                you use our website, dashboard, and APIs (the
                &quot;Service&quot;). By using the Service, you agree to the
                practices described here.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                2. Information We Collect
              </h2>
              <p className="mb-3">
                We collect the following categories of information:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <span className="font-semibold text-cs-ink">
                    Account information
                  </span>{" "}
                  — name, email address, and authentication identifiers we
                  receive from our auth provider (Clerk) when you sign up.
                </li>
                <li>
                  <span className="font-semibold text-cs-ink">
                    Wallet addresses
                  </span>{" "}
                  — public blockchain addresses you connect or submit so we
                  can compute your crypto credit score.
                </li>
                <li>
                  <span className="font-semibold text-cs-ink">
                    Billing data
                  </span>{" "}
                  — handled by Stripe; we receive plan, status, and the last
                  four digits of your card, but not full card numbers.
                </li>
                <li>
                  <span className="font-semibold text-cs-ink">
                    Usage data
                  </span>{" "}
                  — log data such as IP address, user-agent, request paths,
                  and timestamps used for security, debugging, and rate
                  limiting.
                </li>
                <li>
                  <span className="font-semibold text-cs-ink">
                    Communications
                  </span>{" "}
                  — messages you send us through our contact form or to{" "}
                  <a
                    href="mailto:support@zentrascore.com"
                    className="font-semibold text-cs-green-d hover:underline"
                  >
                    support@zentrascore.com
                  </a>
                  .
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                3. How We Use Information
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To provide, maintain, and improve the Service.</li>
                <li>
                  To compute and deliver crypto credit scores and analytics
                  for the wallet addresses you submit.
                </li>
                <li>
                  To process payments, manage subscriptions, and prevent
                  fraud.
                </li>
                <li>
                  To respond to support requests and other communications.
                </li>
                <li>
                  To monitor security, debug issues, and enforce our Terms.
                </li>
                <li>
                  To comply with applicable laws and respond to lawful
                  requests.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                4. On-chain Data
              </h2>
              <p>
                Wallet addresses you submit are public on the underlying
                blockchains. ZentraScore reads publicly available on-chain
                activity (transactions, balances, protocol interactions) to
                compute scores. Submitting a wallet to ZentraScore does not
                make any private information about that wallet public — the
                data is already on-chain.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                5. Service Providers
              </h2>
              <p>
                We share information with vetted service providers that help
                us run the Service, including hosting (e.g. Vercel),
                authentication (Clerk), payment processing (Stripe), database
                infrastructure (Supabase), email delivery (Hostinger), and
                blockchain data providers (Alchemy, Covalent). These providers
                are contractually bound to use information only to provide
                their services to us.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                6. Cookies &amp; Similar Technologies
              </h2>
              <p>
                We use a small number of cookies and similar technologies that
                are strictly necessary to keep you signed in, secure the
                Service, and remember basic preferences. We do not use
                advertising trackers.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                7. Data Retention
              </h2>
              <p>
                We retain account data for as long as your account is active
                and for a reasonable period after to comply with legal
                obligations and resolve disputes. You can request deletion of
                your account at any time by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                8. Security
              </h2>
              <p>
                We use industry-standard administrative, technical, and
                physical safeguards to protect your information. No method of
                transmission or storage is 100% secure, however, and we cannot
                guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                9. Your Rights
              </h2>
              <p>
                Depending on where you live, you may have rights to access,
                correct, delete, port, or restrict the processing of your
                personal information, or to object to it. To exercise any of
                these rights, contact us at{" "}
                <a
                  href="mailto:support@zentrascore.com"
                  className="font-semibold text-cs-green-d hover:underline"
                >
                  support@zentrascore.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                10. Children&apos;s Privacy
              </h2>
              <p>
                The Service is not directed to children under 13 (or the
                applicable age in your jurisdiction). We do not knowingly
                collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                11. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will
                post the updated policy on this page and update the &quot;Last
                updated&quot; date above.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                12. Contact
              </h2>
              <p>
                Questions about this Privacy Policy or your data? Email{" "}
                <a
                  href="mailto:support@zentrascore.com"
                  className="font-semibold text-cs-green-d hover:underline"
                >
                  support@zentrascore.com
                </a>{" "}
                or visit our{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-cs-green-d hover:underline"
                >
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
