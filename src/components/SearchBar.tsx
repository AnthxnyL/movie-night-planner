import { useState } from "react";

type Props = {
  onSearch: (query: string) => void;
  loading: boolean;
};

export function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState("");

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(query);
      }}
    >
      <input
        type="text"
        value={query}
        placeholder="Search a show (e.g. breaking bad)"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
