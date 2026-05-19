import type { Show } from "../../types";

export interface SortStrategy {
  readonly id: string;
  readonly label: string;
  sort(shows: Show[]): Show[];
}

const nullsLast =
  <T>(get: (s: Show) => T | null | undefined, cmp: (a: T, b: T) => number) =>
  (a: Show, b: Show) => {
    const av = get(a);
    const bv = get(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return cmp(av, bv);
  };

export const sortByRatingDesc: SortStrategy = {
  id: "rating-desc",
  label: "Rating (high → low)",
  sort: (shows) =>
    [...shows].sort(nullsLast((s) => s.rating, (a, b) => b - a)),
};

export const sortByPremieredDesc: SortStrategy = {
  id: "premiered-desc",
  label: "Newest first",
  sort: (shows) =>
    [...shows].sort(
      nullsLast(
        (s) => s.premiered,
        (a, b) => b.localeCompare(a),
      ),
    ),
};

export const sortByRuntimeAsc: SortStrategy = {
  id: "runtime-asc",
  label: "Shortest first",
  sort: (shows) =>
    [...shows].sort(nullsLast((s) => s.runtime, (a, b) => a - b)),
};

export const sortByNameAsc: SortStrategy = {
  id: "name-asc",
  label: "Name (A → Z)",
  sort: (shows) =>
    [...shows].sort((a, b) => a.name.localeCompare(b.name)),
};

export const SORT_STRATEGIES: SortStrategy[] = [
  sortByRatingDesc,
  sortByPremieredDesc,
  sortByRuntimeAsc,
  sortByNameAsc,
];
