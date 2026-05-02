"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  Heart,
  House,
  Sparkles,
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
  const { isOpen, close } = useSidebar();


  useEffect(() => {
    if (window.innerWidth >= 1024) return;
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
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
  fixed top-0 left-0 z-50 h-full border-r border-slate-200 bg-white p-5 shadow-lg transition-transform duration-300
  lg:static lg:h-auto lg:rounded-[28px] lg:border lg:shadow-sm lg:w-[260px]
  ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
      >
        <div className="flex items-center gap-3 px-3 py-2">
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

        <nav className="mt-6 space-y-2">
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
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
