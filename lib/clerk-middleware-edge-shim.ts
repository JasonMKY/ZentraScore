/**
 * Replaces `@clerk/nextjs` `clerkMiddleware.js` during bundling.
 * Upstream pulls `AsyncLocalStorage` from `node:async_hooks`, which breaks Vercel Edge
 * middleware (`MIDDLEWARE_INVOCATION_FAILED`). `authMiddleware` only needs
 * `createAuthenticateRequestOptions` and `clerkMiddlewareRequestDataStorage`; the latter
 * can be a no-op because `clerkClient` falls back to header-based request data when
 * `getStore()` is empty.
 */
import { handleMultiDomainAndProxy } from "@clerk-internal/nextjs-server-utils";

export const clerkMiddlewareRequestDataStorage = {
  run<T>(_store: unknown, fn: () => T): T {
    return fn();
  },
  getStore(): undefined {
    return undefined;
  },
};

export function createAuthenticateRequestOptions(
  clerkRequest: Parameters<typeof handleMultiDomainAndProxy>[0],
  options: Record<string, unknown>
) {
  return {
    ...options,
    ...(handleMultiDomainAndProxy(clerkRequest, options) as Record<string, unknown>),
  };
}

export function clerkMiddleware(): never {
  throw new Error(
    "clerkMiddleware() is unavailable with the Edge-safe Clerk shim; use authMiddleware only."
  );
}
