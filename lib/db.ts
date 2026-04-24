// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Next sets this while running `next build` (including on Vercel). */
function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Next.js env load order (later overrides earlier): .env → .env.local →
 * .env.development → .env.development.local. A gitignored `.env.development`
 * with DATABASE_URL=localhost will override Supabase in `.env.local`.
 *
 * During `next build`, Next still imports API route modules to collect page data.
 * Vercel only injects env vars at runtime unless they are attached to the
 * "Build" environment too — so builds can run without DATABASE_URL. We use a
 * placeholder URL only for that phase; the client never connects until a query
 * runs. You must set DATABASE_URL (and DIRECT_URL for Prisma) for production.
 */
function databaseUrl(): string {
  const url = process.env["DATABASE_URL"]?.trim();
  if (url) {
    if (
      process.env.NODE_ENV === "development" &&
      (url.includes("localhost") || url.includes("127.0.0.1"))
    ) {
      console.warn(
        "[db] DATABASE_URL points to localhost. If you use Supabase, remove DATABASE_URL from " +
          "`.env.development` / `.env.development.local` (they load after .env.local and override it)."
      );
    }
    return url;
  }

  if (isNextProductionBuild()) {
    console.warn(
      "[db] DATABASE_URL is unset during Next.js production build. Using a placeholder so the " +
        "build can finish. Set DATABASE_URL (and DIRECT_URL) in Vercel → Settings → Environment " +
        "Variables for Preview and Production, and enable them for **Build** if you need a real DB during build."
    );
    return "postgresql://build:build@127.0.0.1:5432/build?schema=public";
  }

  throw new Error(
    "DATABASE_URL is missing. For local dev, set it in `.env.local`. For Vercel, add it under " +
      "Project → Settings → Environment Variables (use the same Supabase pooler URL as `DATABASE_URL` " +
      "in `.env.local`). Then restart `npm run dev` or redeploy."
  );
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
