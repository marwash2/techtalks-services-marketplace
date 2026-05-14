"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  Bot,
  Sparkles,
  Bell,
  ChevronLeft,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CircleUserRound,
} from "lucide-react";

import { useSidebar } from "@/components/layout/SidebarContext";

const userLinks = [
  { name: "Dashboard", path: "/user/dashboard", icon: Sparkles },
  { name: "AI Assistant", path: "/user/ai-assistant", icon: Bot },
  { name: "Services", path: "/user/services", icon: BriefcaseBusiness },
  { name: "Bookings", path: "/user/bookings", icon: CalendarDays },
  { name: "Notifications", path: "/user/notifications", icon: Bell },
  { name: "Favorites", path: "/user/favorites", icon: Heart },
  { name: "Profile", path: "/user/profile", icon: CircleUserRound },
];

export default function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle, close } = useSidebar();
  const { data: session } = useSession();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    let isMounted = true;

    const loadUnread = async () => {
      try {
        const res = await fetch(
          `/api/notifications?userId=${userId}&page=1&limit=50`,
          { cache: "no-store" }
        );

        if (!res.ok) return;

        const data = await res.json();
        const items = data?.data?.notifications ?? [];

        const unread = items.filter(
          (item: { isRead?: boolean }) => !item.isRead
        ).length;

        if (isMounted) setUnreadCount(unread);
      } catch {}
    };

    const handleNotificationsUpdated = () => {
      void loadUnread();
    };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    void loadUnread();

    const interval = window.setInterval(loadUnread, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );
      window.clearInterval(interval);
    };
  }, [session?.user?.id]); // ✅ FIXED

  function closeOnMobile(): void {
    if (window.innerWidth < 1024) close();
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeOnMobile}
        />
      )}

      <aside
        className={`fixed top-19 left-0 z-50 h-[calc(100vh-4rem)] w-64 border-r bg-[var(--surface-1)] transition-all flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <nav className="flex-1 space-y-2 overflow-y-auto px-0 py-24 lg:py-2">
          {userLinks.map((link) => {
            const Icon = link.icon;

            const isActive =
              pathname === link.path ||
              pathname.startsWith(`${link.path}/`);

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={closeOnMobile}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-5 w-5" />

                <span className={isOpen ? "inline" : "hidden"}>
                  {link.name}
                </span>

                {link.name === "Notifications" &&
                  unreadCount > 0 &&
                  !isOpen && (
                    <span className="absolute left-8 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />
                  )}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE / LOGOUT */}
        <div className="border-t border-slate-200 px-2 py-4 relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((p) => !p)} // ✅ FIXED
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className={isOpen ? "flex-1 text-left" : "hidden"}>
              <p className="text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500">User</p>
            </div>

            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border bg-white shadow-lg">
              <Link
                href="/user/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>

              <Link
                href="/user/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}