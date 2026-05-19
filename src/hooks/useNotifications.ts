import { useEffect, useState } from "react";
import type { Notification } from "../types";
import { notificationCenter } from "../patterns/observer/NotificationCenter";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    return notificationCenter.subscribe(setNotifications);
  }, []);

  return {
    notifications,
    dismiss: (id: string) => notificationCenter.dismiss(id),
  };
}
