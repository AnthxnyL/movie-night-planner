import type { Notification, NotificationKind } from "../../types";

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function build(
  kind: NotificationKind,
  title: string,
  message: string,
): Notification {
  return { id: uid(), kind, title, message, createdAt: Date.now() };
}

export const NotificationFactory = {
  added(showName: string): Notification {
    return build("added", "Added to watchlist", `“${showName}” is queued up.`);
  },
  removed(showName: string): Notification {
    return build("removed", "Removed", `“${showName}” left the watchlist.`);
  },
  duplicate(showName: string): Notification {
    return build(
      "duplicate",
      "Already in watchlist",
      `“${showName}” is already there — nothing to do.`,
    );
  },
  error(message: string): Notification {
    return build("error", "Something went wrong", message);
  },
};
