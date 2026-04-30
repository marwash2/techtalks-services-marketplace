"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Briefcase,
  Calendar,
  TrendingUp,
  Star,
  Bell,
  User,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronsRightIcon,
} from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";
import { useEffect, useRef, useState } from "react";

const providerLinks = [
  {
    name: "Dashboard",
    path: "/provider/dashboard",
    icon: Home,
  },
  {
    name: "Services",
    path: "/provider/services",
    icon: Briefcase,
  },
  {
    name: "Bookings",
    path: "/provider/bookings",
    icon: Calendar,
  },
  {
    name: "Earnings",
    path: "/provider/earnings",
    icon: TrendingUp,
  },
  {
    name: "Reviews",
    path: "/provider/reviews",
    icon: Star,
  },
  {
    name: "Notifications",
    path: "/provider/notifications",
    icon: Bell,
  },
  {
    name: "Availability",
    path: "/provider/availability",
    icon: ChevronsRightIcon,
  },
];

export default function ProviderSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isOpen, close, toggle } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-19
           left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col ${
             isOpen ? "translate-x-0" : "-translate-x-full"
           } lg:translate-x-0 ${isOpen ? "lg:w-54" : "lg:w-15"}`}
      >
        <button
          type="button"
          onClick={toggle}
          className={`fixed top-0 z-60 flex text-bold h-10 w-10 items-center justify-center  text-blue-500  transition  hover:text-slate-900 ${
            isOpen ? "left-49" : "left-10"
          }`}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${isOpen ? "" : "-rotate-180"}`}
          />
        </button>

        <nav className="flex-1 px-0 py-2 space-y-2 overflow-y-auto">
          {providerLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={close}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className={`${isOpen ? "inline" : "hidden"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-2 py-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className={`${isOpen ? "flex-1 text-left" : "hidden"}`}>
                <p className="text-sm font-medium text-slate-900">
                  {session?.user?.name || "Provider"}
                </p>
                <p className="text-xs text-slate-500">Provider</p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10">
                <Link
                  href="/provider/profile"
                  onClick={() => {
                    close();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/provider/settings"
                  onClick={() => {
                    close();
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="h-4 w-4 text-red-600">⎋</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
