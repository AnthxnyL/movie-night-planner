import type { Show } from "../../types";

export interface RecommendationStrategy {
  readonly id: string;
  readonly label: string;
  recommend(pool: Show[], watchlist: Show[], limit: number): Show[];
}

const excludeWatched = (pool: Show[], watchlist: Show[]): Show[] => {
  const ids = new Set(watchlist.map((s) => s.id));
  return pool.filter((s) => !ids.has(s.id));
};

export const topRatedStrategy: RecommendationStrategy = {
  id: "top-rated",
  label: "Top rated",
  recommend(pool, watchlist, limit) {
    return excludeWatched(pool, watchlist)
      .filter((s) => s.rating != null)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
      .slice(0, limit);
  },
};

export const genreMatchStrategy: RecommendationStrategy = {
  id: "genre-match",
  label: "Because you liked…",
  recommend(pool, watchlist, limit) {
    if (watchlist.length === 0) return [];
    const favoriteGenres = new Set(watchlist.flatMap((s) => s.genres));
    return excludeWatched(pool, watchlist)
      .map((show) => {
        const overlap = show.genres.filter((g) => favoriteGenres.has(g)).length;
        return { show, score: overlap + (show.rating ?? 0) / 10 };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ show }) => show);
  },
};

export const autoStrategy: RecommendationStrategy = {
  id: "auto",
  label: "Smart picks",
  recommend(pool, watchlist, limit) {
    const strategy =
      watchlist.length > 0 ? genreMatchStrategy : topRatedStrategy;
    return strategy.recommend(pool, watchlist, limit);
  },
};

export const RECOMMENDATION_STRATEGIES: RecommendationStrategy[] = [
  autoStrategy,
  topRatedStrategy,
  genreMatchStrategy,
];
