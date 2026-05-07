"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BarChart3,
  LayoutDashboard,
  Settings,
  LogOut,
  FileBarChart,
  UserCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Providers", href: "/admin/providers", icon: UserCheck },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Reports", href: "/admin/reports", icon: FileBarChart },
      ],
    },
    {
      section: "System",
      items: [
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
{/* Logo */}
<div className="flex flex-col items-start justify-center px-6 py-4 border-b border-gray-100 gap-2">
  <Link href="/">
    <Image
      src="/logo-icon.png"
      alt="Khidmati Logo"
      width={120}
      height={40}
      priority
    />
  </Link>
  <div className="flex items-center gap-2 pl-1">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
    <span className="text-xl font-semibold text-gray-600 tracking-wide">
      Admin Panel
    </span>
  </div>
</div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">
          {navItems.map((section) => (
            <div key={section.section} className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
                {section.section}
              </p>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition
                        ${isActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-400">admin@email.com</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}