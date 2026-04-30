"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  House,
  Sparkles,
} from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";

const providerLinks = [
  {
    name: "Home",
    path: "/provider/dashboard",
    icon: House,
  },
  {
    name: "Provider Profile",
    path: "/provider/profile",
    icon: CircleUserRound,
  },
  {
    name: "My Services",
    path: "/provider/services",
    icon: BriefcaseBusiness,
  },
  {
    name: "Bookings",
    path: "/provider/bookings",
    icon: CalendarDays,
  },
];

export default function ProviderSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full border-r border-slate-200 bg-white p-5 shadow-lg transition-transform duration-300 lg:static lg:top-24 lg:h-auto lg:rounded-[28px] lg:border lg:shadow-sm lg:w-[260px] lg:self-start
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden lg:p-0"}
        `}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-900">
              Khidmati
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Provider Area
            </p>
          </div>
        </div>

        <nav className="mt-6 space-y-2">
          {providerLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={close}
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
