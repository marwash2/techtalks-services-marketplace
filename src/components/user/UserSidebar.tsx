"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  Heart,
  House,
  Bot,
  Sparkles,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";
import Image from "next/image";
import { useEffect } from "react";

const userLinks = [
  {
    name: "Home",
    path: "/",
    icon: House,
  },
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
    path: "/notifications",
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

  const { isOpen, close, open } = useSidebar();

  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* MOBILE TOPBAR */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <Image
            src="/dashboard-logo.jpg"
            alt="Khidmati Logo"
            width={40}
            height={40}
            className="rounded-xl object-contain"
          />

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Khidmati
            </h2>
            <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">
              User Area
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (isOpen) {
              close();
            } else {
              open();
            }
          }}
          className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => {
            if (window.innerWidth < 1024) close();
          }}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[280px] border-r border-slate-200 bg-white p-5 shadow-xl transition-transform duration-300
          lg:static lg:h-auto lg:translate-x-0 lg:rounded-[28px] lg:border lg:shadow-sm lg:w-[260px]
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* DESKTOP HEADER */}
        <div className="hidden items-center gap-3 px-3 py-2 lg:flex">
          <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white">
            <Image
              src="/dashboard-logo.jpg"
              alt="Khidmati Logo"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>

          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-900">
              Khidmati
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              User Area
            </p>
          </div>
        </div>

        {/* MOBILE CLOSE */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-3">
            <Image
              src="/dashboard-logo.jpg"
              alt="Khidmati Logo"
              width={40}
              height={40}
              className="rounded-xl object-contain"
            />

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Khidmati
              </h2>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                User Area
              </p>
            </div>
          </div>

          <button
            onClick={close}
            className="rounded-xl p-2 hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-700" />
          </button>
        </div>

        <nav className="mt-4 space-y-2 lg:mt-6">
          {userLinks.map((link) => {
            const Icon = link.icon;

            const isActive =
              link.path === "/"
                ? pathname === "/"
                : pathname === link.path ||
                  pathname.startsWith(`${link.path}/`);

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={(event) => {
                  if (link.name === "Home") {
                    event.preventDefault();
                    router.push("/user/dashboard");
                    router.refresh();
                    close();
                    return;
                  }

                  close();
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <span className="text-lg">⎋</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>
    </>
  );
}