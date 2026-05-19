import { useCallback, useMemo, useRef, useState } from "react";
import type { Show } from "../types";
import { watchlistRepository } from "../patterns/repository/WatchlistRepository";
import {
  AddShowCommand,
  CommandHistory,
  RemoveShowCommand,
} from "../patterns/command/WatchlistCommand";

export function useWatchlist() {
  const [shows, setShows] = useState<Show[]>(() => watchlistRepository.getAll());
  const historyRef = useRef(new CommandHistory());

  const sync = useCallback(() => {
    setShows(watchlistRepository.getAll());
  }, []);

  const add = useCallback(
    (show: Show) => {
      historyRef.current.run(new AddShowCommand(watchlistRepository, show));
      sync();
    },
    [sync],
  );

  const remove = useCallback(
    (showId: number) => {
      historyRef.current.run(
        new RemoveShowCommand(watchlistRepository, showId),
      );
      sync();
    },
    [sync],
  );

  const undo = useCallback(() => {
    const undone = historyRef.current.undoLast();
    if (undone) sync();
    return undone;
  }, [sync]);

  const has = useCallback(
    (showId: number) => shows.some((s) => s.id === showId),
    [shows],
  );

  const historySize = historyRef.current.size();

  return useMemo(
    () => ({ shows, add, remove, undo, has, historySize }),
    [shows, add, remove, undo, has, historySize],
  );
}
