import type { Show } from "../../types";

const STORAGE_KEY = "show-night-planner:watchlist";

export interface IWatchlistRepository {
  getAll(): Show[];
  save(shows: Show[]): void;
  clear(): void;
}

export class LocalStorageWatchlistRepository implements IWatchlistRepository {
  getAll(): Show[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Show[]) : [];
    } catch {
      return [];
    }
  }

  save(shows: Show[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const watchlistRepository: IWatchlistRepository =
  new LocalStorageWatchlistRepository();
