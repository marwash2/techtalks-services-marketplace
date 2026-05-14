"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";

export default function ProviderMobileHeader() {
  const { toggle } = useSidebar();

  return (
    <div className="fixed top-[73px] left-0 z-[55] lg:hidden p-3">
      <button
        onClick={toggle}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
}