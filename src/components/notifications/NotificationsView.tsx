"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Bell, CalendarCheck2, CircleCheckBig, Clock3 } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
};

function getRelativeTime(dateValue?: string) {
  if (!dateValue) return "just now";
  const ms = Date.now() - new Date(dateValue).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min > 1 ? "s" : ""} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr > 1 ? "s" : ""} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day > 1 ? "s" : ""} ago`;
}

function NotificationIcon({ type }: { type?: string }) {
  if (type === "booking") return <CalendarCheck2 className="h-5 w-5 text-green-600" />;
  if (type === "system") return <Bell className="h-5 w-5 text-blue-600" />;
  return <Clock3 className="h-5 w-5 text-orange-500" />;
}

export default function NotificationsView() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&page=1&limit=50`, {
        cache: "no-store",
      });
      const data = await res.json();
      setItems(data?.data?.notifications ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    void loadNotifications();
  }, [userId]);

  const markRead = async (notificationId: string) => {
    await fetch(`/api/notifications/${notificationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setItems((prev) => prev.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item)));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const markAllRead = async () => {
    const unreadItems = items.filter((item) => !item.isRead);
    await Promise.all(
      unreadItems.map((item) =>
        fetch(`/api/notifications/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        })
      )
    );
    setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    window.dispatchEvent(new Event("notifications-updated"));
  };

  if (status === "loading") return <div className="mx-auto max-w-4xl px-4 py-10">Loading...</div>;
  if (!session?.user) return <div className="mx-auto max-w-4xl px-4 py-10 text-center">Please log in.</div>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-600">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
        >
          Mark all as read
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <CircleCheckBig className="mx-auto h-8 w-8 text-green-600" />
            <p className="mt-3 text-gray-800">No notifications yet.</p>
          </div>
        ) : (
          <ul>
            {items.map((item, index) => (
              <li key={item.id} className={`flex items-start gap-3 p-4 ${index > 0 ? "border-t border-gray-100" : ""}`}>
                <div className="mt-1 rounded-full bg-gray-50 p-2">
                  <NotificationIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{item.title}</h2>
                      <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                      <p className="mt-1 text-xs text-gray-500">{getRelativeTime(item.createdAt)}</p>
                    </div>
                    {!item.isRead && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-green-500" />}
                  </div>
                  <div className="mt-3 flex gap-3">
                    {item.link && (
                      <Link href={item.link} onClick={() => void markRead(item.id)} className="text-sm font-medium text-green-700 hover:underline">
                        Open
                      </Link>
                    )}
                    {!item.isRead && (
                      <button onClick={() => void markRead(item.id)} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

