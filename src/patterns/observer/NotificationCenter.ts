import type { Notification } from "../../types";

type Listener = (notifications: Notification[]) => void;

export class NotificationCenter {
  private notifications: Notification[] = [];
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => {
      this.listeners.delete(listener);
    };
  }

  publish(notification: Notification): void {
    this.notifications = [notification, ...this.notifications].slice(0, 20);
    this.emit();
  }

  dismiss(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.notifications);
    }
  }
}

export const notificationCenter = new NotificationCenter();
