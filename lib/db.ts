// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Next.js env load order (later overrides earlier): .env → .env.local →
 * .env.development → .env.development.local. A gitignored `.env.development`
 * with DATABASE_URL=localhost will override Supabase in `.env.local`.
 */
function databaseUrl(): string {
  const url = process.env["DATABASE_URL"];
  if (!url?.trim()) {
    throw new Error(
      "DATABASE_URL is missing. Set it in .env.local and restart `npm run dev`."
    );
  }
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
