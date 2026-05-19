import { useMemo, useState } from "react";
import type { Show } from "./types";
import { tvMazeService } from "./patterns/facade/TVMazeService";
import {
  SORT_STRATEGIES,
  type SortStrategy,
} from "./patterns/strategy/SortStrategy";
import { notificationCenter } from "./patterns/observer/NotificationCenter";
import { NotificationFactory } from "./patterns/factory/NotificationFactory";
import {
  autoStrategy,
  type RecommendationStrategy,
} from "./patterns/strategy/RecommendationStrategy";
import { useWatchlist } from "./hooks/useWatchlist";
import { SearchBar } from "./components/SearchBar";
import { SortSelector } from "./components/SortSelector";
import { ShowCard } from "./components/ShowCard";
import { Notifications } from "./components/Notifications";
import { Recommendations } from "./components/Recommendations";

export function App() {
  const [results, setResults] = useState<Show[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortStrategy, setSortStrategy] = useState<SortStrategy>(
    SORT_STRATEGIES[0],
  );
  const [recommendationStrategy, setRecommendationStrategy] =
    useState<RecommendationStrategy>(autoStrategy);
  const watchlist = useWatchlist();

  const sortedResults = useMemo(
    () => sortStrategy.sort(results),
    [results, sortStrategy],
  );
  const sortedWatchlist = useMemo(
    () => sortStrategy.sort(watchlist.shows),
    [watchlist.shows, sortStrategy],
  );

  async function handleSearch(query: string) {
    setLoading(true);
    try {
      const shows = await tvMazeService.search(query);
      setResults(shows);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      notificationCenter.publish(NotificationFactory.error(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>🎬 Show Night Planner</h1>
        <p>Search shows, build a watchlist, plan tonight.</p>
      </header>

      <section className="app__controls">
        <SearchBar onSearch={handleSearch} loading={loading} />
        <SortSelector value={sortStrategy} onChange={setSortStrategy} />
        <button
          type="button"
          className="app__undo"
          disabled={watchlist.historySize === 0}
          onClick={() => watchlist.undo()}
        >
          ↶ Undo last
        </button>
      </section>

      <section className="app__results">
        <h2>Search results</h2>
        {sortedResults.length === 0 ? (
          <p className="app__empty">No results yet. Try a search.</p>
        ) : (
          <div className="grid">
            {sortedResults.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                inWatchlist={watchlist.has(show.id)}
                onAdd={watchlist.add}
                onRemove={watchlist.remove}
              />
            ))}
          </div>
        )}
      </section>

      <section className="app__watchlist">
        <h2>Your watchlist ({watchlist.shows.length})</h2>
        {sortedWatchlist.length === 0 ? (
          <p className="app__empty">Empty. Add shows from search results.</p>
        ) : (
          <div className="grid">
            {sortedWatchlist.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                inWatchlist
                onAdd={watchlist.add}
                onRemove={watchlist.remove}
              />
            ))}
          </div>
        )}
      </section>

      <Recommendations
        watchlist={watchlist.shows}
        strategy={recommendationStrategy}
        onStrategyChange={setRecommendationStrategy}
        onAdd={watchlist.add}
        onRemove={watchlist.remove}
        has={watchlist.has}
      />


      <Notifications />
    </div>
  );
}
