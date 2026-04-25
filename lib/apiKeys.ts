import crypto from "node:crypto";
import { db } from "@/lib/db";
import type { SubscriptionPlan } from "@/types";

export type ApiPrincipal = {
  source: "api_key";
  apiKeyId: string;
  userId: string;
  plan: SubscriptionPlan;
};

type KeyRecord = {
  id: string;
  userId: string;
  active: boolean;
  user: { plan: SubscriptionPlan };
};

const KEY_BYTES = 24;

function keyPrefix(): "cs_live_" | "cs_test_" {
  return process.env.NODE_ENV === "production" ? "cs_live_" : "cs_test_";
}

export function hashApiKey(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function parseBearerApiKey(req: Request): string | null {
  const authz = req.headers.get("authorization");
  if (!authz) return null;
  const [scheme, token] = authz.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export function generateApiKeyValue(): { token: string; prefix: string } {
  const token = `${keyPrefix()}${crypto.randomBytes(KEY_BYTES).toString("hex")}`;
  return { token, prefix: token.slice(0, 14) };
}

export async function resolveApiPrincipalFromToken(
  token: string
): Promise<ApiPrincipal | null> {
  const keyHash = hashApiKey(token);
  const key = (await db.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      active: true,
      user: { select: { plan: true } },
    },
  })) as KeyRecord | null;

  if (!key || !key.active) return null;

  // Fire-and-forget usage tracking.
  db.apiKey
    .update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    source: "api_key",
    apiKeyId: key.id,
    userId: key.userId,
    plan: key.user.plan,
  };
}

