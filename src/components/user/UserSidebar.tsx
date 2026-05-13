"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  Bot,
  Sparkles,
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
} from "lucide-react";

import { useSidebar } from "@/components/layout/SidebarContext";

import { useEffect, useState } from "react";

const userLinks = [
  {
    name: "Dashboard",
    path: "/user/dashboard",
    icon: Sparkles,
  },

  {
    name: "AI Assistant",
    path: "/user/ai-assistant",
    icon: Bot,
  },

  {
    name: "Services",
    path: "/user/services",
    icon: BriefcaseBusiness,
  },

  {
    name: "Bookings",
    path: "/user/bookings",
    icon: CalendarDays,
  },

  {
    name: "Notifications",
    path: "/user/notifications",
    icon: Bell,
  },

  {
    name: "Favorites",
    path: "/user/favorites",
    icon: Heart,
  },

  {
    name: "Profile",
    path: "/user/profile",
    icon: CircleUserRound,
  },
];

export default function UserSidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const { data: session } =
    useSession();

  const [unreadCount, setUnreadCount] =
    useState(0);

  const { isOpen, close, toggle } =
    useSidebar();

  useEffect(() => {
    const userId =
      session?.user?.id;

    if (!userId) return;

    let isMounted = true;

    const loadUnread = async () => {
      try {
        const res = await fetch(
          `/api/notifications?userId=${userId}&page=1&limit=50`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) return;

        const data =
          await res.json();

        const items =
          data?.data?.notifications ??
          [];

        const unread = items.filter(
          (item: {
            isRead?: boolean;
          }) => !item.isRead,
        ).length;

        if (isMounted)
          setUnreadCount(unread);
      } catch {
        // no-op
      }
    };

    const handleNotificationsUpdated =
      () => {
        void loadUnread();
      };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated,
    );

    void loadUnread();

    const interval =
      window.setInterval(
        loadUnread,
        5000,
      );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated,
      );

      window.clearInterval(interval);
    };
  }, [session?.user?.id, notificationsEnabled]);

  return (
    <>
      {/* MOBILE HEADER — hamburger only, no logo (logo lives in the navbar) */}
      

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-50 left-0 z-50 h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white shadow-sm transition-all duration-300 flex flex-col ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0 ${
          isOpen
            ? "lg:w-54"
            : "lg:w-15"
        }`}
      >
        <button
          type="button"
          onClick={toggle}
          className={`fixed top-2 z-60 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 ${
            isOpen
              ? "left-49"
              : "left-10"
          }`}
          aria-label={
            isOpen
              ? "Collapse sidebar"
              : "Expand sidebar"
          }
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${
              isOpen
                ? ""
                : "-rotate-180"
            }`}
          />
        </button>

        <nav className="flex-1 space-y-2 overflow-y-auto px-0 py-24 lg:py-2">
          {userLinks.map((link) => {
            const Icon = link.icon;

            const isActive =
              link.path === "/"
                ? pathname === "/"
                : pathname ===
                    link.path ||
                  pathname.startsWith(
                    `${link.path}/`,
                  );

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={(event) => {
                  if (
                    link.name ===
                    "Home"
                  ) {
                    event.preventDefault();

                    router.push(
                      "/user/dashboard",
                    );

                    router.refresh();

                    return;
                  }
                }}
                className={`relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />

                {link.name ===
                  "Notifications" &&
                  unreadCount > 0 &&
                  !isOpen && (
                    <span className="absolute left-8 top-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}

                <span
                  className={`${
                    isOpen
                      ? "inline"
                      : "hidden"
                  }`}
                >
                  {link.name}
                </span>

                {link.name ===
                  "Notifications" &&
                  unreadCount > 0 &&
                  isOpen && (
                    <span className="ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
                      {unreadCount > 9
                        ? "9+"
                        : unreadCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-2 py-4">
          <button
            type="button"
            onClick={() =>
              signOut({
                callbackUrl: "/",
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 text-red-600" />

            <span
              className={`${
                isOpen
                  ? "inline"
                  : "hidden"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}