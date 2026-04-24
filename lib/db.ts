// lib/db.ts
import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma instances in development (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Next sets this while running `next build`. */
function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/** Vercel / CI typically run `npm run build`, which sets this. */
function isNpmBuildScript(): boolean {
  return process.env.npm_lifecycle_event === "build";
}

/**
 * Next.js env load order (later overrides earlier): .env → .env.local →
 * .env.development → .env.development.local. A gitignored `.env.development`
 * with DATABASE_URL=localhost will override Supabase in `.env.local`.
 *
 * Prisma must not be constructed at **import** time: `next build` still loads
 * API route modules ("collect page data"), and Vercel often does not expose
 * DATABASE_URL during that phase unless you attach it to the Build environment.
 * We lazy-init the client (see `getPrisma`) and only use a placeholder URL when
 * the URL is still missing at first use during a detected build.
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

  if (isNextProductionBuild() || isNpmBuildScript()) {
    console.warn(
      "[db] DATABASE_URL is unset during build. Using a placeholder URL so the build can finish. " +
        "Set DATABASE_URL and DIRECT_URL in Vercel → Settings → Environment Variables for runtime."
    );
    return "postgresql://build:build@127.0.0.1:5432/build?schema=public";
  }

  throw new Error(
    "DATABASE_URL is missing. For local dev, set it in `.env.local`. For Vercel, add it under " +
      "Project → Settings → Environment Variables (use the same Supabase pooler URL as `DATABASE_URL` " +
      "in `.env.local`). Then restart `npm run dev` or redeploy."
  );
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: databaseUrl() } },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/**
 * Lazy Prisma proxy: importing `@/lib/db` does not touch `DATABASE_URL` until
 * the first query. That avoids Vercel build failures when env is build-time empty.
 */
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...a: unknown[]) => unknown).bind(client);
    }
    return value;
  },
}) as PrismaClient;
