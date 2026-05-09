"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  ShieldCheck,
  CheckCheck,
  Sparkles,
  ArrowLeft,
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

  const ms =
    Date.now() -
    new Date(dateValue).getTime();

  const min = Math.floor(ms / 60000);

  if (min < 1) return "just now";

  if (min < 60)
    return `${min} minute${
      min > 1 ? "s" : ""
    } ago`;

  const hr = Math.floor(min / 60);

  if (hr < 24)
    return `${hr} hour${
      hr > 1 ? "s" : ""
    } ago`;

  const day = Math.floor(hr / 24);

  return `${day} day${
    day > 1 ? "s" : ""
  } ago`;
}

function getNotificationStyle(type?: string) {
  switch (type) {
    case "booking_created":
      return {
        icon: CalendarCheck2,
        iconColor: "text-green-600",
        bg: "bg-green-50",
      };

    case "booking_pending":
      return {
        icon: CircleDashed,
        iconColor: "text-amber-600",
        bg: "bg-amber-50",
      };

    case "booking_confirmed":
      return {
        icon: BadgeCheck,
        iconColor: "text-emerald-600",
        bg: "bg-emerald-50",
      };

    case "booking_cancelled":
      return {
        icon: CircleX,
        iconColor: "text-red-600",
        bg: "bg-red-50",
      };

    case "booking_completed":
      return {
        icon: CircleCheckBig,
        iconColor: "text-blue-600",
        bg: "bg-blue-50",
      };

    case "service_updated":
    case "booking_updated":
      return {
        icon: RefreshCcw,
        iconColor: "text-orange-600",
        bg: "bg-orange-50",
      };

    case "service_deleted":
      return {
        icon: Trash2,
        iconColor: "text-rose-600",
        bg: "bg-rose-50",
      };

    case "service_added":
      return {
        icon: BadgeCheck,
        iconColor: "text-green-600",
        bg: "bg-green-50",
      };

    case "system":
      return {
        icon: Bell,
        iconColor: "text-indigo-600",
        bg: "bg-indigo-50",
      };

    default:
      return {
        icon: Clock3,
        iconColor: "text-gray-600",
        bg: "bg-gray-50",
      };
  }
}

function NotificationIcon({
  type,
}: {
  type?: string;
}) {
  const style = getNotificationStyle(type);

  const Icon = style.icon;

  return (
    <Icon
      className={`h-5 w-5 ${style.iconColor}`}
    />
  );
}

export default function NotificationsView() {
  const router = useRouter();

  const { data: session, status } =
    useSession();

  const [items, setItems] = useState<
    NotificationItem[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const userId = session?.user?.id;

  const unreadCount = useMemo(
    () =>
      items.filter((item) => !item.isRead)
        .length,
    [items]
  );

  const loadNotifications = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/notifications?userId=${userId}&page=1&limit=50`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      setItems(
        data?.data?.notifications ?? []
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;

    void loadNotifications();
  }, [userId]);

  const markRead = async (
    notificationId: string
  ) => {
    await fetch(
      `/api/notifications/${notificationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          isRead: true,
        }),
      }
    );

    setItems((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? { ...item, isRead: true }
          : item
      )
    );

    window.dispatchEvent(
      new Event("notifications-updated")
    );
  };

  const markAllRead = async () => {
    const unreadItems = items.filter(
      (item) => !item.isRead
    );

    await Promise.all(
      unreadItems.map((item) =>
        fetch(
          `/api/notifications/${item.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              isRead: true,
            }),
          }
        )
      )
    );

    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
      }))
    );

    window.dispatchEvent(
      new Event("notifications-updated")
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center">
        <div className="text-[#4b6fa8] font-medium">
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center">
        <div className="bg-white border border-blue-100 rounded-3xl p-10 text-center">
          <Bell className="w-10 h-10 text-blue-400 mx-auto mb-4" />

          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
            Please log in
          </h2>

          <p className="text-sm text-[#6b93c4]">
            You need to log in to access your
            notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* BACK BUTTON */}
        <button
          onClick={() =>
            router.push("/user/dashboard")
          }
          className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-100 hover:border-blue-200 rounded-2xl px-4 py-3 text-sm font-semibold text-[#1e3a5f] transition hover:bg-blue-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">

          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">

            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Bell className="w-3 h-3" />
              Notifications
            </span>

            <h1
              className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
              style={{
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              Notification Center
            </h1>

            <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl mb-6">
              Stay updated with your bookings,
              services, account activity, and
              important platform updates.
            </p>

            <div className="flex flex-wrap gap-2.5">

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Bell className="w-4 h-4 text-blue-500" />
                {items.length} Notifications
              </span>

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Secure Updates
              </span>

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Real-time Activity
              </span>

            </div>
          </div>
        </section>

        {/* HEADER */}
        <section className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <h2
                className="text-2xl text-[#1e3a5f] mb-1"
                style={{
                  fontFamily:
                    "'DM Serif Display', serif",
                }}
              >
                Recent Notifications
              </h2>

              <p className="text-sm text-[#6b93c4]">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>

            </div>

            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-200 transition text-white rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>

          </div>
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white border-[1.5px] border-blue-100 rounded-3xl overflow-hidden">

          {loading ? (
            <div className="p-10 text-center text-[#6b93c4]">
              Loading notifications...
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CircleCheckBig className="w-7 h-7 text-blue-500" />
              </div>

              <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
                No notifications yet
              </h2>

              <p className="text-sm text-[#6b93c4]">
                Your latest activity and updates
                will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-blue-50">

              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 transition border-l-4 ${
                    item.isRead
                      ? "bg-white hover:bg-blue-50/40 border-transparent"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500"
                  }`}
                >

                  <div className="flex items-start gap-4">

                    <div
                      className={`mt-1 rounded-2xl p-3 ${
                        getNotificationStyle(
                          item.type
                        ).bg
                      }`}
                    >
                      <NotificationIcon
                        type={item.type}
                      />
                    </div>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-3">

                        <div>

                          <div className="flex items-center gap-2">

                            <h3
                              className={`font-semibold ${
                                item.isRead
                                  ? "text-[#1e3a5f]"
                                  : "text-blue-700"
                              }`}
                            >
                              {item.title}
                            </h3>

                          </div>

                          <p className="mt-1 text-sm text-[#4b6fa8] leading-relaxed">
                            {item.message}
                          </p>

                          <p className="mt-2 text-xs text-[#8aa6ca]">
                            {getRelativeTime(
                              item.createdAt
                            )}
                          </p>

                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-4">

                        {item.link && (
                          <Link
                            href={item.link}
                            onClick={() =>
                              void markRead(
                                item.id
                              )
                            }
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Open
                          </Link>
                        )}

                        {!item.isRead && (
                          <button
                            onClick={() =>
                              void markRead(
                                item.id
                              )
                            }
                            className="text-sm font-medium text-[#6b93c4] hover:text-[#1e3a5f]"
                          >
                            Mark as read
                          </button>
                        )}

                      </div>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}
        </section>
      </div>
    </div>
  );
}