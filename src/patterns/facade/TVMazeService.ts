import type { Show } from "../../types";

type RawShow = {
  id: number;
  name: string;
  summary: string | null;
  image: { medium: string; original: string } | null;
  rating: { average: number | null };
  premiered: string | null;
  runtime: number | null;
  genres: string[];
  language: string | null;
};

const API_BASE = "https://api.tvmaze.com";

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

function toShow(raw: RawShow): Show {
  return {
    id: raw.id,
    name: raw.name,
    summary: stripHtml(raw.summary),
    image: raw.image?.medium ?? null,
    rating: raw.rating?.average ?? null,
    premiered: raw.premiered,
    runtime: raw.runtime,
    genres: raw.genres ?? [],
    language: raw.language,
  };
}

export class TVMazeService {
  async search(query: string): Promise<Show[]> {
    if (!query.trim()) return [];
    const res = await fetch(
      `${API_BASE}/search/shows?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) throw new Error(`TVMaze search failed: ${res.status}`);
    const data: { show: RawShow }[] = await res.json();
    return data.map((entry) => toShow(entry.show));
  }

  async getById(id: number): Promise<Show> {
    const res = await fetch(`${API_BASE}/shows/${id}`);
    if (!res.ok) throw new Error(`TVMaze getById failed: ${res.status}`);
    const raw: RawShow = await res.json();
    return toShow(raw);
  }

  async getPool(page: number = 0): Promise<Show[]> {
    const res = await fetch(`${API_BASE}/shows?page=${page}`);
    if (!res.ok) throw new Error(`TVMaze getPool failed: ${res.status}`);
    const raw: RawShow[] = await res.json();
    return raw.map(toShow);
  }
}

export const tvMazeService = new TVMazeService();
