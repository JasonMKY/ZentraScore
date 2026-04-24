// lib/webhooks/dispatcher.ts
// Called whenever a score changes to notify registered webhook endpoints.

import { createHmac } from "crypto";
import { db } from "@/lib/db";
import type { ScoreResult } from "@/types";

interface WebhookPayload {
  event: "score.updated" | "score.expired" | "score.defaulted";
  address: string;
  previousScore?: number;
  newScore: number;
  delta?: number;
  grade: string;
  timestamp: string;
  webhookId: string;
}

async function sendWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<boolean> {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-ZentraScore-Signature": `t=${timestamp},v1=${signature}`,
        "X-ZentraScore-Event": payload.event,
        "User-Agent": "ZentraScore-Webhooks/1.0",
      },
      body,
      signal: AbortSignal.timeout(5000), // 5-second timeout
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function dispatchScoreUpdate(
  address: string,
  newScore: ScoreResult,
  previousScore?: number
): Promise<void> {
  const delta = previousScore !== undefined ? newScore.score - previousScore : undefined;

  // Find all active webhooks monitoring this address
  const webhooks = await db.webhookEndpoint.findMany({
    where: {
      active: true,
      events: { has: "score.updated" },
      addresses: { has: address.toLowerCase() },
    },
  });

  if (webhooks.length === 0) return;

  const timestamp = new Date().toISOString();

  await Promise.allSettled(
    webhooks.map(async (webhook) => {
      // Apply threshold filter
      if (
        webhook.threshold !== null &&
        delta !== undefined &&
        Math.abs(delta) < webhook.threshold
      ) {
        return; // Delta too small — skip
      }

      const payload: WebhookPayload = {
        event: "score.updated",
        address,
        previousScore,
        newScore: newScore.score,
        delta,
        grade: newScore.grade,
        timestamp,
        webhookId: webhook.id,
      };

      const success = await sendWebhook(webhook.url, webhook.secret, payload);

      if (success) {
        await db.webhookEndpoint.update({
          where: { id: webhook.id },
          data: { lastFiredAt: new Date() },
        });
      } else {
        console.warn(`[webhook] Delivery failed to ${webhook.url}`);
        // In production: implement retry queue with exponential backoff
      }
    })
  );
}
