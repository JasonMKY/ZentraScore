import type { Metadata } from "next";
import DocsClient from "@/components/docs/DocsClient";

export const metadata: Metadata = {
  title: "Crypto Credit Score API — Docs & Reference",
  description:
    "REST API and on-chain oracle reference for the ZentraScore crypto credit score. Index DeFi activity, fetch cryptocurrency credit scores, and integrate on-chain credit data into your lending stack.",
  alternates: { canonical: "/docs" },
  keywords: [
    "crypto credit score API",
    "cryptocurrency credit score API",
    "on-chain credit score API",
    "DeFi credit score API",
    "credit score oracle",
    "blockchain credit score REST API",
    "ZentraScore docs",
  ],
  openGraph: {
    title: "Crypto Credit Score API — ZentraScore Docs",
    description:
      "Integrate on-chain credit scoring into your lending protocol, dApp, or risk stack. Full REST + oracle reference.",
    url: "/docs",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crypto Credit Score API Reference",
    description:
      "REST API + on-chain oracle for cryptocurrency credit scores across 18+ DeFi protocols.",
  },
};

const techArticleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "ZentraScore API v1 — Crypto Credit Score Reference",
  name: "ZentraScore API v1",
  description:
    "REST API and on-chain oracle reference for the ZentraScore crypto credit score. Fetch scores, stream webhooks, and read verified credit ratings on-chain.",
  about: {
    "@type": "Thing",
    name: "Crypto credit score API",
  },
  keywords:
    "crypto credit score API, cryptocurrency credit score, on-chain credit score, DeFi lending, blockchain credit rating",
  author: {
    "@type": "Organization",
    name: "ZentraScore",
  },
  publisher: {
    "@type": "Organization",
    name: "ZentraScore",
  },
  proficiencyLevel: "Intermediate",
};

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(techArticleSchema),
        }}
      />
      <DocsClient />
    </>
  );
}
