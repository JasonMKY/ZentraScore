import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Inter, DM_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
});

/** Ensures metadata URLs (icons, OG) resolve correctly on Vercel and custom domains. */
const normalizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
};

const metadataBaseUrl =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBaseUrl(process.env.VERCEL_URL) ||
  "https://zentrascore.com";

const SEO_KEYWORDS = [
  "crypto credit score",
  "cryptocurrency credit score",
  "on-chain credit score",
  "blockchain credit score",
  "DeFi credit score",
  "credit score",
  "DeFi lending",
  "undercollateralized lending",
  "wallet credit score",
  "Ethereum credit score",
  "on-chain credit rating",
  "crypto credit rating",
  "DeFi credit rating",
  "crypto underwriting",
  "Web3 credit score",
];

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1a12" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: {
    default:
      "ZentraScore — Crypto Credit Score for DeFi & On-Chain Lending",
    template: "%s | ZentraScore",
  },
  description:
    "ZentraScore is the leading crypto credit score for DeFi. Get an on-chain, blockchain-verified cryptocurrency credit score to unlock undercollateralized lending, lower rates, and higher limits.",
  keywords: SEO_KEYWORDS,
  applicationName: "ZentraScore",
  authors: [{ name: "ZentraScore", url: metadataBaseUrl }],
  creator: "ZentraScore",
  publisher: "ZentraScore",
  category: "finance",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: metadataBaseUrl,
    siteName: "ZentraScore",
    title:
      "ZentraScore — Crypto Credit Score for DeFi & On-Chain Lending",
    description:
      "The first on-chain credit scoring infrastructure for DeFi. A crypto credit score built from every borrow, repayment, and liquidation across 18+ protocols.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZentraScore — Crypto Credit Score for DeFi",
    description:
      "On-chain cryptocurrency credit score that unlocks undercollateralized lending, better rates, and higher limits across DeFi.",
    creator: "@zentrascore",
    site: "@zentrascore",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "format-detection": "telephone=no",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ZentraScore",
  legalName: "ZentraScore",
  url: metadataBaseUrl,
  logo: `${metadataBaseUrl}/icon.png`,
  description:
    "ZentraScore provides the first blockchain-native crypto credit score for DeFi — an on-chain credit rating built from verified on-chain activity.",
  foundingDate: "2025",
  knowsAbout: [
    "Crypto credit score",
    "Cryptocurrency credit score",
    "On-chain credit score",
    "DeFi credit score",
    "Blockchain credit rating",
    "Undercollateralized lending",
  ],
  sameAs: [
    "https://twitter.com/zentrascore",
    "https://github.com/zentrascore",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "support@zentrascore.com",
      contactType: "customer support",
      availableLanguage: ["English"],
    },
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ZentraScore",
  url: metadataBaseUrl,
  inLanguage: "en-US",
  description:
    "Crypto credit score for DeFi — on-chain, verifiable, and updated in real time.",
  publisher: {
    "@type": "Organization",
    name: "ZentraScore",
    url: metadataBaseUrl,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${metadataBaseUrl}/docs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmMono.variable}`}>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#00c98d",
              colorBackground: "#ffffff",
              fontFamily: "Inter, sans-serif",
              borderRadius: "10px",
            },
            elements: {
              formButtonPrimary:
                "bg-[#00c98d] hover:bg-[#00a870] text-white font-semibold",
              card: "shadow-xl border border-gray-100",
            },
          }}
        >
          <Nav />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
