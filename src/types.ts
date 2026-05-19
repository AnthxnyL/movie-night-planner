export type Show = {
  id: number;
  name: string;
  summary: string;
  image: string | null;
  rating: number | null;
  premiered: string | null;
  runtime: number | null;
  genres: string[];
  language: string | null;
};

export type NotificationKind = "added" | "removed" | "duplicate" | "error";

export type Notification = {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: number;
};
