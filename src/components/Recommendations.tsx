import type { Show } from "../types";
import {
  RECOMMENDATION_STRATEGIES,
  type RecommendationStrategy,
} from "../patterns/strategy/RecommendationStrategy";
import { useRecommendations } from "../hooks/useRecommendations";
import { ShowCard } from "./ShowCard";

type Props = {
  watchlist: Show[];
  strategy: RecommendationStrategy;
  onStrategyChange: (strategy: RecommendationStrategy) => void;
  onAdd: (show: Show) => void;
  onRemove: (id: number) => void;
  has: (id: number) => boolean;
};

export function Recommendations({
  watchlist,
  strategy,
  onStrategyChange,
  onAdd,
  onRemove,
  has,
}: Props) {
  const { recommendations, loading } = useRecommendations(watchlist, strategy);

  return (
    <section className="app__recommendations">
      <header className="recommendations__header">
        <h2>Recommended for you</h2>
        <label className="sort-selector">
          Mode{" "}
          <select
            value={strategy.id}
            onChange={(e) => {
              const next = RECOMMENDATION_STRATEGIES.find(
                (s) => s.id === e.target.value,
              );
              if (next) onStrategyChange(next);
            }}
          >
            {RECOMMENDATION_STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      {loading ? (
        <p className="app__empty">Loading recommendations…</p>
      ) : recommendations.length === 0 ? (
        <p className="app__empty">
          {strategy.id === "genre-match"
            ? "Add shows to your watchlist to get genre-based picks."
            : "No recommendations available."}
        </p>
      ) : (
        <div className="grid">
          {recommendations.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              inWatchlist={has(show.id)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  );
}
