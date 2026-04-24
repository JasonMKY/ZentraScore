// hooks/useScore.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ScoreResult } from "@/types";

interface UseScoreOptions {
  address?: string;
  autoFetch?: boolean;
  fresh?: boolean;
}

interface UseScoreReturn {
  score: ScoreResult | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetch: (fresh?: boolean) => Promise<void>;
  invalidate: () => void;
}

export function useScore({
  address,
  autoFetch = true,
  fresh = false,
}: UseScoreOptions): UseScoreReturn {
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(
    async (forceFresh = false) => {
      if (!address) return;

      const hadScore = score !== null;
      if (hadScore) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/score/${address}?fresh=${forceFresh || fresh}`
        );

        if (res.status === 404) {
          const err = await res.json();
          setError(
            err.reason?.startsWith("wallet_too_young")
              ? `Wallet is too new — needs 6+ months of DeFi history. ${
                  err.reason.includes(":") ? `(${err.reason.split(":")[1]} days so far)` : ""
                }`
              : "No scoring history found for this wallet."
          );
          setScore(null);
          return;
        }

        if (res.status === 429) {
          setError("Rate limit reached. Please wait a moment before refreshing.");
          return;
        }

        if (!res.ok) {
          const err = await res.json();
          setError(err.message ?? "Failed to fetch score");
          return;
        }

        const data: ScoreResult = await res.json();
        setScore(data);
        setError(null);
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [address, fresh, score]
  );

  useEffect(() => {
    if (autoFetch && address) {
      fetchScore(false);
    }
  }, [address]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = useCallback(() => {
    setScore(null);
    setError(null);
  }, []);

  return {
    score,
    isLoading,
    isRefreshing,
    error,
    fetch: fetchScore,
    invalidate,
  };
}
