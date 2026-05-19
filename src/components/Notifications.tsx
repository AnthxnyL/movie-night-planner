import { useNotifications } from "../hooks/useNotifications";

export function Notifications() {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notifications">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification notification--${n.kind}`}
          onClick={() => dismiss(n.id)}
          role="alert"
        >
          <strong>{n.title}</strong>
          <p>{n.message}</p>
        </div>
      ))}
    </div>
  );
}
