import { useEffect, useMemo, useState } from "react";
import type { Show } from "../types";
import { tvMazeService } from "../patterns/facade/TVMazeService";
import {
  type RecommendationStrategy,
  autoStrategy,
} from "../patterns/strategy/RecommendationStrategy";
import { notificationCenter } from "../patterns/observer/NotificationCenter";
import { NotificationFactory } from "../patterns/factory/NotificationFactory";

const DEFAULT_LIMIT = 6;

export function useRecommendations(
  watchlist: Show[],
  strategy: RecommendationStrategy = autoStrategy,
  limit: number = DEFAULT_LIMIT,
) {
  const [pool, setPool] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    tvMazeService
      .getPool(0)
      .then((shows) => {
        if (!cancelled) setPool(shows);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        notificationCenter.publish(NotificationFactory.error(message));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const recommendations = useMemo(
    () => strategy.recommend(pool, watchlist, limit),
    [pool, watchlist, strategy, limit],
  );

  return { recommendations, loading };
}
