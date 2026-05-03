"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  CalendarCheck2,
  CircleCheckBig,
  Clock3,
  CircleX,
  RefreshCcw,
  Trash2,
  CircleDashed,
  BadgeCheck,
} from "lucide-react";

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

function getNotificationStyle(type?: string) {
  switch (type) {
    case "booking_created":
      return { icon: CalendarCheck2, iconColor: "text-green-600", bg: "bg-green-50", unreadDot: "bg-green-500" };
    case "booking_pending":
      return { icon: CircleDashed, iconColor: "text-amber-600", bg: "bg-amber-50", unreadDot: "bg-amber-500" };
    case "booking_confirmed":
      return { icon: BadgeCheck, iconColor: "text-emerald-600", bg: "bg-emerald-50", unreadDot: "bg-emerald-500" };
    case "booking_cancelled":
      return { icon: CircleX, iconColor: "text-red-600", bg: "bg-red-50", unreadDot: "bg-red-500" };
    case "booking_completed":
      return { icon: CalendarCheck2, iconColor: "text-blue-600", bg: "bg-blue-50", unreadDot: "bg-blue-500" };
    case "service_updated":
    case "booking_updated":
      return { icon: RefreshCcw, iconColor: "text-orange-600", bg: "bg-orange-50", unreadDot: "bg-orange-500" };
    case "service_deleted":
      return { icon: Trash2, iconColor: "text-rose-600", bg: "bg-rose-50", unreadDot: "bg-rose-500" };
    case "service_added":
      return { icon: BadgeCheck, iconColor: "text-green-600", bg: "bg-green-50", unreadDot: "bg-green-500" };
    case "system":
      return { icon: Bell, iconColor: "text-indigo-600", bg: "bg-indigo-50", unreadDot: "bg-indigo-500" };
    case "booking":
      return { icon: CalendarCheck2, iconColor: "text-green-600", bg: "bg-green-50", unreadDot: "bg-green-500" };
    default:
      return { icon: Clock3, iconColor: "text-gray-600", bg: "bg-gray-50", unreadDot: "bg-gray-500" };
  }
}

function NotificationIcon({ type }: { type?: string }) {
  const style = getNotificationStyle(type);
  const Icon = style.icon;
  return <Icon className={`h-5 w-5 ${style.iconColor}`} />;
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
                <div className={`mt-1 rounded-full p-2 ${getNotificationStyle(item.type).bg}`}>
                  <NotificationIcon type={item.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-gray-900">{item.title}</h2>
                      <p className="mt-1 text-sm text-gray-700">{item.message}</p>
                      <p className="mt-1 text-xs text-gray-500">{getRelativeTime(item.createdAt)}</p>
                    </div>
                    {!item.isRead && <span className={`mt-2 h-2.5 w-2.5 rounded-full ${getNotificationStyle(item.type).unreadDot}`} />}
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

