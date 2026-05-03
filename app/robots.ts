import type { MetadataRoute } from "next";

const normalizeBaseUrl = (value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return withProtocol.replace(/\/$/, "");
};

const BASE_URL =
  normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  normalizeBaseUrl(process.env.VERCEL_URL) ||
  "https://zentrascore.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/dashboard/",
          "/sign-in",
          "/sign-in/",
          "/sign-up",
          "/sign-up/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
