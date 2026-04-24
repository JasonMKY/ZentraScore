import Redis from "ioredis";
import type { ScoreResult } from "@/types";

let redis: Redis | null = null;
/**
 * When Redis is unreachable we disable caching for the rest of the process so
 * every request doesn't keep hitting the connection error (which costs ~500ms
 * per call and spams logs). Restart the server after starting Redis to reset.
 */
let redisDisabled = false;
let loggedDisable = false;

function getRedis(): Redis | null {
  if (redisDisabled) return null;
  if (!process.env.REDIS_URL) {
    return null;
  }
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 1500,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redis.on("error", (err) => {
      const msg = err?.message ?? String(err);
      // Common "Redis not running locally" cases — disable silently.
      if (
        /ECONNREFUSED|ENOTFOUND|Stream isn't writeable|Connection is closed/i.test(
          msg
        )
      ) {
        if (!redisDisabled) {
          redisDisabled = true;
          if (!loggedDisable) {
            loggedDisable = true;
            console.warn(
              "[cache] Redis unavailable (REDIS_URL=" +
                (process.env.REDIS_URL ?? "") +
                "). Caching + rate-limit disabled for this process. Start Redis and restart the server to re-enable."
            );
          }
          // Stop the client so pending commands don't keep logging.
          try {
            redis?.disconnect();
          } catch {
            /* noop */
          }
          redis = null;
        }
        return;
      }
      console.error("[cache] Redis error:", msg);
    });
  }
  return redis;
}

const SCORE_TTL_SECONDS = 60 * 60;
const SCORE_KEY_PREFIX = "score:v1:";

export async function getCachedScore(
  address: string
): Promise<ScoreResult | null> {
  try {
    const client = getRedis();
    if (!client) return null;
    const raw = await client.get(SCORE_KEY_PREFIX + address.toLowerCase());
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ScoreResult;

    if (new Date(parsed.expiresAt) < new Date()) {
      await client.del(SCORE_KEY_PREFIX + address.toLowerCase());
      return null;
    }

    return { ...parsed, fromCache: true };
  } catch (err) {
    if (!redisDisabled) {
      console.error("[cache] getCachedScore failed:", (err as Error).message);
    }
    return null;
  }
}

export async function getCachedScores(
  addresses: string[]
): Promise<(ScoreResult | null)[]> {
  try {
    const client = getRedis();
    if (!client || addresses.length === 0) {
      return addresses.map(() => null);
    }

    const keys = addresses.map(
      (a) => SCORE_KEY_PREFIX + a.toLowerCase()
    );
    const rawValues = await client.mget(...keys);
    const now = new Date();

    return rawValues.map((raw) => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as ScoreResult;
        if (new Date(parsed.expiresAt) < now) return null;
        return { ...parsed, fromCache: true };
      } catch {
        return null;
      }
    });
  } catch (err) {
    if (!redisDisabled) {
      console.error("[cache] getCachedScores MGET failed:", (err as Error).message);
    }
    return addresses.map(() => null);
  }
}

export async function setCachedScore(
  address: string,
  score: Omit<ScoreResult, "fromCache">
): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    const value = JSON.stringify({ ...score, fromCache: false });
    await client.setex(
      SCORE_KEY_PREFIX + address.toLowerCase(),
      SCORE_TTL_SECONDS,
      value
    );
  } catch (err) {
    if (!redisDisabled) {
      console.error("[cache] setCachedScore failed:", (err as Error).message);
    }
  }
}

export async function invalidateScore(address: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;
    await client.del(SCORE_KEY_PREFIX + address.toLowerCase());
  } catch (err) {
    if (!redisDisabled) {
      console.error("[cache] invalidateScore failed:", (err as Error).message);
    }
  }
}

export async function checkRateLimit(
  userId: string,
  requestsPerMin: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const client = getRedis();
    if (!client) {
      return { allowed: true, remaining: requestsPerMin, resetAt: Date.now() + 60000 };
    }
    const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`;
    const current = await client.incr(key);
    await client.expire(key, 60);

    const remaining = Math.max(0, requestsPerMin - current);
    const resetAt = Math.ceil(Date.now() / 60000) * 60000;

    return {
      allowed: current <= requestsPerMin,
      remaining,
      resetAt,
    };
  } catch {
    return { allowed: true, remaining: requestsPerMin, resetAt: Date.now() + 60000 };
  }
}
