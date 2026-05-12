"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
  FileBarChart,
  UserCheck,
  Clock,
  ChevronLeft,
  Bell,
  Briefcase,
  FolderTree,
} from "lucide-react";

const navItems = [
  {
    section: "Main",
    items: [
      { name: "Dashboard",         href: "/admin/dashboard",           icon: LayoutDashboard, sub: false },
      { name: "Users",             href: "/admin/users",               icon: Users,           sub: false },
      { name: "Providers",         href: "/admin/providers",           icon: UserCheck,       sub: false },
      { name: "Pending Approvals", href: "/admin/providers/approvals", icon: Clock,           sub: true  },
      { name: "Services",          href: "/admin/services",            icon: Briefcase,       sub: false },
      { name: "Categories",        href: "/admin/categories",          icon: FolderTree,      sub: false },
      { name: "Analytics",         href: "/admin/analytics",           icon: BarChart3,       sub: false },
      { name: "Reports",           href: "/admin/reports",             icon: FileBarChart,    sub: false },
    ],
  },
  {
    section: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings, sub: false },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function fetchPendingApprovals() {
      try {
        const res = await fetch("/api/providers?page=1&limit=1000", {
          cache: "no-store",
        });
        const data = await res.json();
        const providers = data?.data?.providers || [];
        const pending = providers.filter((p: any) => p.providerStatus === "pending").length;
        if (mounted) setPendingApprovals(pending);
      } catch {
        if (mounted) setPendingApprovals(0);
      }
    }
    fetchPendingApprovals();
    const intervalId = setInterval(fetchPendingApprovals, 30000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [pathname]);

  const displayedNavItems = useMemo(
    () =>
      navItems.map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => item.name !== "Notifications" || pendingApprovals > 0
        ),
      })),
    [pendingApprovals]
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside
        className={`relative flex flex-col h-screen sticky top-0 border-r border-gray-200 bg-white transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Toggle button — same circle style as provider sidebar */}
        <button
          type="button"
          onClick={() => setIsOpen((p) => !p)}
          className="absolute -right-4 top-6 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
          />
        </button>

        {/* Logo */}
        <div className={`flex flex-col border-b border-gray-100 gap-2 transition-all duration-300 ${isOpen ? "items-start px-6 py-4" : "items-center px-3 py-4"}`}>
          <Link href="/">
            <Image
              src="/logo-icon.png"
              alt="Logo"
              width={isOpen ? 120 : 32}
              height={isOpen ? 40 : 32}
              priority
              className="rounded-lg"
            />
          </Link>
          {isOpen && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-xl font-semibold text-gray-600 tracking-wide">
                Admin Panel
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-5 px-3 min-h-0">
          {displayedNavItems.map((section) => (
            <div key={section.section} className="mb-6">
              {isOpen ? (
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-2">
                  {section.section}
                </p>
              ) : (
                <div className="mb-3 border-t border-gray-100" />
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isOpen ? item.name : undefined}
                      className={`flex items-center gap-3 py-2.5 rounded-xl text-sm transition-all
                        ${isOpen ? "px-3" : "px-2 justify-center"}
                        ${item.sub && isOpen
                          ? "ml-4 pl-3 border-l-2 " + (isActive ? "border-blue-400" : "border-gray-200")
                          : ""}
                        ${isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      {isOpen && (
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>{item.name}</span>
                          {item.name === "Notifications" && pendingApprovals > 0 && (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                              {pendingApprovals}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`border-t border-gray-100 p-4 ${!isOpen ? "flex flex-col items-center gap-3" : ""}`}>
          {isOpen ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold shrink-0">
                  A
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-400">admin@email.com</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <div title="Admin" className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                A
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Logout"
                className="flex items-center justify-center w-9 h-9 rounded-xl text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 min-w-0">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
