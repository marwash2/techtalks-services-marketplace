"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();
  const { toggle } = useSidebar();
  const previousUnreadRef = useRef(0);
  const initializedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const user = session?.user;
  const role = user?.role;
  const notificationsPath = role ? `/${role}/notifications` : "/notifications";

  const isActive = (path: string) => pathname === path;

  const navLinks = !session
    ? [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: "Providers", path: "/providers" },
        { name: "About", path: "/about" },
      ]
    : role === "admin"
      ? [
          { name: "Dashboard", path: "/admin/dashboard" },
          { name: "Users", path: "/admin/users" },
          { name: "Providers", path: "/admin/providers" },
          { name: "Reports", path: "/admin/reports" },
        ]
      : [];

  const hasSidebar = role === "user" || role === "provider";

  const playTone = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.mp3");
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    } catch {
      // Ignore autoplay/audio failures.
    }
  };

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setUnreadCount(0);
      previousUnreadRef.current = 0;
      initializedRef.current = false;
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}&page=1&limit=50`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        const items = data?.data?.notifications ?? [];
        const unread = items.filter((item: { isRead?: boolean }) => !item.isRead).length;
        if (!isMounted) return;

        setUnreadCount(unread);

        if (initializedRef.current && unread > previousUnreadRef.current) {
          playTone();
        }

        previousUnreadRef.current = unread;
        initializedRef.current = true;
      } catch {
        // Keep navbar resilient if notifications are unavailable.
      }
    };

    const handleNotificationsUpdated = () => {
      void loadNotifications();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);
    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 5000);

    return () => {
      isMounted = false;
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
      window.clearInterval(interval);
    };
  }, [session?.user?.id]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* LEFT: Notification + Logo */}
        <div className="flex items-center gap-4 ">
          {/* Notification bell for logged-in users */}

          <Link href="/" className="flex items-center">
            <Image src="/logo-icon.png" alt="Logo" width={150} height={80} />
          </Link>
        </div>

        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`
                  relative font-medium transition duration-300
                  text-gray-700 hover:text-blue-600
                  after:content-[''] after:absolute after:left-0 after:-bottom-1
                  after:h-[2px] after:w-0 after:bg-blue-600
                  after:transition-all after:duration-300
                  hover:after:w-full
                  ${isActive(link.path) ? "text-blue-600 after:w-full" : ""}
                `}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {hasSidebar && <div className="hidden md:block flex-1" />}

        <div className="hidden md:flex items-center gap-3 space-x-4">
          {!session ? (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition">
                Log in
              </Link>

              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user?.role === "provider" && (
                <span className="text-sm text-gray-500">Provider Panel</span>
              )}

              {user?.role === "admin" && <span className="text-sm text-gray-500">Admin Panel</span>}

              {user?.role !== "provider" && (
                <Link
                  href={notificationsPath}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border border-gray-300 bg-red-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {user?.role !== "provider" && (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md transition cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              )}
            </>
          )}
        </div>

        {!hasSidebar && (
          <button
            className="md:hidden text-2xl text-gray-700 cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}

        {hasSidebar && <div className="md:hidden w-8" />}
      </div>

      {!hasSidebar && (
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 border-t bg-white
            ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-6 py-5 space-y-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMenuOpen(false)}
                className={`
                  w-full block font-medium transition
                  text-gray-700 hover:text-blue-600
                  hover:underline underline-offset-4 decoration-2 decoration-blue-600
                  ${isActive(link.path) ? "text-blue-600 underline underline-offset-4 decoration-blue-600" : ""}
                `}
              >
                {link.name}
              </Link>
            ))}

            <div className="border-t pt-4 space-y-3">
              {!session ? (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="text-blue-600 font-semibold block"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-red-500">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
