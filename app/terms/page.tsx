import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ZentraScore Terms of Service — the rules for using the ZentraScore website, dashboard, and crypto credit score API.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const lastUpdated = "May 7, 2026";

export default function TermsPage() {
  return (
    <>
      <main className="pt-[68px] min-h-screen bg-cs-paper">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <p className="text-[11px] font-bold tracking-[.1em] uppercase text-cs-green-d mb-3">
            Legal
          </p>
          <h1 className="text-[clamp(28px,3.4vw,40px)] font-extrabold text-cs-ink tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-[13px] text-cs-ink4 font-mono mb-10">
            Last updated: {lastUpdated}
          </p>

          <div className="bg-white border-[1.5px] border-cs-border rounded-[16px] p-6 sm:p-8 lg:p-10 shadow-cs-sm space-y-8 text-[15px] leading-relaxed text-cs-ink2">
            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                1. Agreement
              </h2>
              <p>
                These Terms of Service (the &quot;Terms&quot;) are a binding
                agreement between you and ZentraScore (&quot;ZentraScore&quot;,
                &quot;we&quot;, &quot;us&quot;) and govern your access to and
                use of the ZentraScore website, dashboard, APIs, and related
                services (collectively, the &quot;Service&quot;). By creating
                an account or otherwise using the Service, you agree to these
                Terms.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                2. Eligibility &amp; Account
              </h2>
              <p>
                You must be at least 18 years old and able to form a binding
                contract to use the Service. You are responsible for keeping
                your account credentials, API keys, and connected wallets
                secure, and for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                3. Description of the Service
              </h2>
              <p>
                ZentraScore aggregates publicly available on-chain data to
                generate informational credit scores for cryptocurrency wallet
                addresses. Scores, analytics, and any related metrics are
                provided for informational purposes only and do not constitute
                financial, investment, legal, tax, or other professional
                advice.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                4. Subscriptions, Billing &amp; Refunds
              </h2>
              <p>
                Paid plans are billed in advance on a recurring basis through
                Stripe. You authorize us (and our payment processor) to charge
                your payment method for any plan you select until you cancel.
                You may cancel at any time from your dashboard; cancellation
                takes effect at the end of the current billing period. Except
                where required by law, fees are non-refundable.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                5. Acceptable Use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Use the Service to violate any law or third-party right.
                </li>
                <li>
                  Reverse engineer, scrape, or attempt to extract underlying
                  models or non-public data from the Service.
                </li>
                <li>
                  Resell, sublicense, or distribute the Service without our
                  written permission.
                </li>
                <li>
                  Interfere with, overload, or disrupt the Service or its
                  underlying infrastructure.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                6. API Usage &amp; Rate Limits
              </h2>
              <p>
                Each plan includes specific request quotas and rate limits
                described on our pricing page or in your dashboard. We may
                throttle, suspend, or terminate keys that exceed limits,
                attempt to circumvent quotas, or otherwise abuse the Service.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                7. Intellectual Property
              </h2>
              <p>
                The Service, including all software, models, designs, content,
                and trademarks, is owned by ZentraScore or its licensors. We
                grant you a limited, non-exclusive, non-transferable, revocable
                license to use the Service in accordance with these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                8. Disclaimers
              </h2>
              <p>
                The Service is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, whether
                express, implied, or statutory. We do not warrant that the
                Service will be uninterrupted, error-free, or that any data,
                score, or analytics will be accurate, current, or fit for any
                particular purpose.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, ZentraScore and its
                officers, employees, and affiliates will not be liable for any
                indirect, incidental, special, consequential, or punitive
                damages, or any loss of profits, revenue, or data, arising out
                of or relating to your use of the Service. Our total aggregate
                liability for any claim relating to the Service will not exceed
                the amount you paid us in the twelve (12) months preceding the
                event giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                10. Termination
              </h2>
              <p>
                We may suspend or terminate your access to the Service at any
                time if you violate these Terms or if we determine, in our
                reasonable discretion, that continued provision of the Service
                poses a risk to ZentraScore or other users.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                11. Changes to These Terms
              </h2>
              <p>
                We may update these Terms from time to time. If we make
                material changes, we will notify you by email or through the
                Service. Your continued use of the Service after the changes
                take effect constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-[18px] font-bold text-cs-ink mb-2">
                12. Contact
              </h2>
              <p>
                Questions about these Terms? Email us at{" "}
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
