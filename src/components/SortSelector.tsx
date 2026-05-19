import type { SortStrategy } from "../patterns/strategy/SortStrategy";
import { SORT_STRATEGIES } from "../patterns/strategy/SortStrategy";

type Props = {
  value: SortStrategy;
  onChange: (strategy: SortStrategy) => void;
};

export function SortSelector({ value, onChange }: Props) {
  return (
    <label className="sort-selector">
      Sort by{" "}
      <select
        value={value.id}
        onChange={(e) => {
          const next = SORT_STRATEGIES.find((s) => s.id === e.target.value);
          if (next) onChange(next);
        }}
      >
        {SORT_STRATEGIES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}
