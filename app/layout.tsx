import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
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
  "https://zentrascore.io";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "ZentraScore — On-Chain Credit Intelligence",
  description:
    "The first credit score built entirely from blockchain data. Unlock undercollateralized lending, better rates, and higher limits.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "ZentraScore",
    description: "On-chain credit scoring for DeFi",
    url: "https://zentrascore.io",
    siteName: "ZentraScore",
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
