import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import type { SubscriptionPlan } from "@/types";
import {
  parseBearerApiKey,
  resolveApiPrincipalFromToken,
  type ApiPrincipal,
} from "@/lib/apiKeys";

export type RequestPrincipal =
  | {
      source: "clerk";
      clerkId: string;
      userId: string;
      plan: SubscriptionPlan;
    }
  | ApiPrincipal;

export async function resolveRequestPrincipal(
  req: Request
): Promise<RequestPrincipal | null> {
  const token = parseBearerApiKey(req);
  if (token) {
    const apiPrincipal = await resolveApiPrincipalFromToken(token);
    if (apiPrincipal) return apiPrincipal;
  }

  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.user.findUnique({
    where: { clerkId },
    select: { id: true, plan: true },
  });
  if (!user) return null;

  return {
    source: "clerk",
    clerkId,
    userId: user.id,
    plan: user.plan as SubscriptionPlan,
  };
}

