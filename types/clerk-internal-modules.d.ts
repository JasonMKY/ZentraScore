declare module "@clerk-internal/nextjs-server-utils" {
  export function handleMultiDomainAndProxy(
    clerkRequest: unknown,
    opts: unknown
  ): Record<string, unknown>;
}
