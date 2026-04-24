import { authMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk's default `clerkMiddleware` module imports `node:async_hooks`, which breaks Edge.
 * `next.config.js` replaces that module with `lib/clerk-middleware-edge-shim.ts` so this
 * `authMiddleware` bundle stays Edge-safe while `auth()` still receives Clerk headers.
 *
 * Only `/dashboard` and `/api/checkout` require a signed-in user; everything else is public
 * for middleware purposes (individual API handlers may still return 401).
 */
export default authMiddleware({
  ignoredRoutes: ["/api/webhooks(.*)"],
  publicRoutes: [
    "/",
    "/pricing(.*)",
    "/docs(.*)",
    "/contact(.*)",
    "/api/contact(.*)",
    "/api/oracle",
    "/api/score(.*)",
    "/api/me(.*)",
    "/api/wallets(.*)",
    "/api/wallet-positions(.*)",
    "/api/alerts(.*)",
    "/api/billing(.*)",
  ],
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
