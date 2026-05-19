import type { Show } from "../types";

type Props = {
  show: Show;
  inWatchlist: boolean;
  onAdd: (show: Show) => void;
  onRemove: (id: number) => void;
};

export function ShowCard({ show, inWatchlist, onAdd, onRemove }: Props) {
  return (
    <article className="show-card">
      {show.image ? (
        <img src={show.image} alt={show.name} />
      ) : (
        <div className="show-card__placeholder">No image</div>
      )}
      <div className="show-card__body">
        <header>
          <h3>{show.name}</h3>
          <span className="show-card__rating">
            {show.rating != null ? `★ ${show.rating.toFixed(1)}` : "—"}
          </span>
        </header>
        <p className="show-card__meta">
          {show.premiered ?? "?"} ·{" "}
          {show.runtime != null ? `${show.runtime} min` : "?"} ·{" "}
          {show.genres.slice(0, 2).join(", ") || "Unknown genre"}
        </p>
        <p className="show-card__summary">
          {show.summary.slice(0, 180)}
          {show.summary.length > 180 ? "…" : ""}
        </p>
        {inWatchlist ? (
          <button
            type="button"
            className="show-card__btn show-card__btn--danger"
            onClick={() => onRemove(show.id)}
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            className="show-card__btn"
            onClick={() => onAdd(show)}
          >
            + Add to watchlist
          </button>
        )}
      </div>
    </article>
  );
}
