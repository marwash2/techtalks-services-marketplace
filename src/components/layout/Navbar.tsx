"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";
import BecomeProviderButtons from "./BecomeProviderButtons";
import { readUserPreferences } from "@/lib/user-preferences";

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(true);

  const { data: session } =
    useSession();

  const { isOpen, toggle } =
    useSidebar();

  const previousUnreadRef =
    useRef(0);

  const initializedRef =
    useRef(false);

  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    );

  const user = session?.user;

  const role = user?.role;

  const notificationsPath = role
    ? `/${role}/notifications`
    : "/notifications";

  const isActive = (path: string) =>
    pathname === path;

  const navLinks = !session
    ? [
        {
          name: "Home",
          path: "/",
        },
        {
          name: "Services",
          path: "/services",
        },
        {
          name: "Providers",
          path: "/providers",
        },
        {
          name: "About",
          path: "/about",
        },
      ]
    : role === "admin"
      ? [
          {
            name: "Dashboard",
            path: "/admin/dashboard",
          },
          {
            name: "Users",
            path: "/admin/users",
          },
          {
            name: "Providers",
            path: "/admin/providers",
          },
          {
            name: "Reports",
            path: "/admin/reports",
          },
        ]
      : [];

  const hasSidebar =
    role === "user" ||
    role === "provider";

  const playTone = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(
          "/sounds/notification.mp3"
        );

        audioRef.current.volume = 0.5;
      }

      audioRef.current.currentTime = 0;

      void audioRef.current.play();
    } catch {
      // Ignore autoplay/audio failures.
    }
  };

  useEffect(() => {
    const syncPrefs = () => {
      const prefs =
        readUserPreferences(
          session?.user?.id
        );

      setNotificationsEnabled(
        prefs.notificationsEnabled
      );
    };

    syncPrefs();

    window.addEventListener(
      "user-preferences-changed",
      syncPrefs
    );

    return () =>
      window.removeEventListener(
        "user-preferences-changed",
        syncPrefs
      );
  }, [session?.user?.id]);

  useEffect(() => {
    const userId =
      session?.user?.id;

    if (
      !userId ||
      !notificationsEnabled
    ) {
      setUnreadCount(0);

      previousUnreadRef.current = 0;

      initializedRef.current = false;

      return;
    }

    let isMounted = true;

    const loadNotifications =
      async () => {
        try {
          const res = await fetch(
            `/api/notifications?userId=${userId}&page=1&limit=50`,
            {
              cache: "no-store",
            }
          );

          if (!res.ok) return;

          const data =
            await res.json();

          const items =
            data?.data
              ?.notifications ?? [];

          const unread =
            items.filter(
              (item: {
                isRead?: boolean;
              }) => !item.isRead
            ).length;

          if (!isMounted) return;

          setUnreadCount(unread);

          if (
            initializedRef.current &&
            unread >
              previousUnreadRef.current
          ) {
            playTone();
          }

          previousUnreadRef.current =
            unread;

          initializedRef.current =
            true;
        } catch {
          // Keep navbar resilient if notifications are unavailable.
        }
      };

    const handleNotificationsUpdated =
      () => {
        void loadNotifications();
      };

    window.addEventListener(
      "notifications-updated",
      handleNotificationsUpdated
    );

    void loadNotifications();

    const interval =
      window.setInterval(
        loadNotifications,
        5000
      );

    return () => {
      isMounted = false;

      window.removeEventListener(
        "notifications-updated",
        handleNotificationsUpdated
      );

      window.clearInterval(interval);
    };
  }, [
    session?.user?.id,
    notificationsEnabled,
  ]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--border-color)] bg-[color:color-mix(in_srgb,var(--surface-1)_85%,transparent)] backdrop-blur-md transition-all duration-300 ${
        hasSidebar
          ? isOpen
            ? "lg:ml-54"
            : "lg:ml-15"
          : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {hasSidebar && (
            <button
              className="cursor-pointer text-2xl text-gray-700 lg:hidden"
              onClick={toggle}
              aria-label="Toggle sidebar menu"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          <Link
            href="/"
            className="flex items-center"
          >
            <Image
              src="/logo-icon.png"
              alt="Logo"
              width={150}
              height={80}
            />
          </Link>
        </div>

        {/* DESKTOP NAV */}
        {navLinks.length > 0 && (
          <nav className="hidden items-center gap-8 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`
                  relative font-medium transition duration-300
                  text-[var(--foreground)] hover:text-blue-600
                  after:absolute after:-bottom-1 after:left-0
                  after:h-[2px] after:w-0
                  after:bg-blue-600
                  after:transition-all after:duration-300
                  after:content-['']
                  hover:after:w-full
                  ${
                    isActive(
                      link.path
                    )
                      ? "text-blue-600 after:w-full"
                      : ""
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        {hasSidebar && (
          <div className="hidden flex-1 md:block" />
        )}

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-2 space-x-2 md:flex">
          {!session ? (
            <>
              <BecomeProviderButtons
                value="Become a Provider"
                classes="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-slate-600 transition hover:text-blue-600"
              />

              <Link
                href="/login"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              {user?.role ===
                "provider" && (
                <span className="text-sm text-gray-500">
                  Provider Panel
                </span>
              )}

              {user?.role ===
                "admin" && (
                <span className="text-sm text-gray-500">
                  Admin Panel
                </span>
              )}
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        {!hasSidebar && (
          <button
            className="cursor-pointer text-2xl text-gray-700 md:hidden"
            onClick={() =>
              setMenuOpen(
                (prev) => !prev
              )
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        )}
      </div>

      {/* MOBILE MENU */}
      {!hasSidebar && (
        <div
          className={`
            overflow-hidden border-t border-[var(--border-color)] bg-[var(--surface-1)] transition-all duration-300 md:hidden
            ${
              menuOpen
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div className="flex flex-col space-y-4 px-6 py-5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() =>
                  setMenuOpen(false)
                }
                className={`
                  block w-full font-medium transition
                  text-gray-700 hover:text-blue-600
                  hover:underline underline-offset-4 decoration-2 decoration-blue-600
                  ${
                    isActive(
                      link.path
                    )
                      ? "text-blue-600 underline underline-offset-4 decoration-blue-600"
                      : ""
                  }
                `}
              >
                {link.name}
              </Link>
            ))}

            <div className="space-y-3 border-t pt-4">
              {!session ? (
                <div className="flex flex-col gap-3">
                  {/* BECOME PROVIDER */}
                  <BecomeProviderButtons
                    value="Become a Provider"
                    classes="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  />

                  {/* LOGIN BUTTON */}
                  <Link
                    href="/login"
                    onClick={() =>
                      setMenuOpen(
                        false
                      )
                    }
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Log in
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() =>
                    signOut({
                      callbackUrl:
                        "/",
                    })
                  }
                  className="text-red-500"
                >
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