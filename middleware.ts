import { authMiddleware } from "@clerk/nextjs/server";

/**
 * `clerkMiddleware` pulls in Node-only `AsyncLocalStorage` and can fail on Vercel Edge with
 * `MIDDLEWARE_INVOCATION_FAILED`. `authMiddleware` stays Edge-safe and still wires Clerk so
 * `auth()` works in routes and RSC.
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
