"use client";

import { useSidebar } from "@/components/layout/SidebarContext";
import { Menu } from "lucide-react";

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, isOpen } = useSidebar();

  return (
    <div className="mx-auto max-w-7xl py-8 ">
      {/* Mobile hamburger */}
      <button
        onClick={open}
        className="lg:hidden fixed top-4 left-4 z-50 rounded-xl bg-white p-2 shadow"
      >
        <Menu className="h-5 w-5 cursor-pointer"/>
      </button>

      <div
        className={`min-w-0 transition-all duration-300 ${isOpen ? "lg:ml-54" : "lg:ml-15"}`}
      >
        {children}
      </div>
    </div>
  );
}
