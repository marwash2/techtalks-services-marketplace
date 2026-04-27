"use client";

import UserSidebar from "@/components/user/UserSidebar";
import UserDashboardSummary from "@/components/user/UserDashboardSummary";
import { useSidebar } from "@/components/layout/SidebarContext";
import { Menu } from "lucide-react";

export default function UserLayoutClient({
  children,
  name,
}: {
  children: React.ReactNode;
  name?: string | null;
}) {
  const { open } = useSidebar();

  return (
    <div className="mx-auto max-w-7xl py-8 ">
      {/* Mobile hamburger */}
      <button
        onClick={open}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-white p-2 shadow"
      >
        <Menu className="h-5 w-5 cursor-pointer"/>
      </button>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <UserSidebar />

        <div className="min-w-0 flex-1">
          <UserDashboardSummary name={name} />
          {children}
        </div>
      </div>
    </div>
  );
}