import type { Metadata } from "next";
import Footer from "@/components/Footer";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact ZentraScore — Crypto Credit Score Support",
  description:
    "Talk to the ZentraScore team about crypto credit score integrations, DeFi partnerships, pricing, or support. We reply from support@zentrascore.com.",
  alternates: { canonical: "/contact" },
  keywords: [
    "ZentraScore contact",
    "crypto credit score support",
    "cryptocurrency credit score help",
    "DeFi credit score partnerships",
  ],
  openGraph: {
    title: "Contact ZentraScore",
    description:
      "Questions about the crypto credit score API, pricing, or partnerships? Talk to our team.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact ZentraScore — Crypto Credit Score",
    description:
      "Reach the ZentraScore team for crypto credit score integrations, partnerships, and support.",
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact ZentraScore",
  description:
    "Talk to the ZentraScore team about crypto credit score integrations, DeFi partnerships, pricing, or support.",
  mainEntity: {
    "@type": "Organization",
    name: "ZentraScore",
    email: "support@zentrascore.com",
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "support@zentrascore.com",
        contactType: "customer support",
        availableLanguage: ["English"],
      },
    ],
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactSchema),
        }}
      />
      <main className="pt-[68px] min-h-screen bg-cs-paper">
        <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <p className="text-[11px] font-bold tracking-[.1em] uppercase text-cs-green-d mb-3">
            Contact
          </p>
          <h1 className="text-[clamp(24px,3vw,34px)] font-extrabold text-cs-ink tracking-tight mb-3">
            Talk to us about your crypto credit score
          </h1>
          <p className="text-[15px] text-cs-ink3 leading-relaxed mb-10">
            Product questions, DeFi partnerships, or support for the crypto
            credit score API — we read every message.
          </p>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
