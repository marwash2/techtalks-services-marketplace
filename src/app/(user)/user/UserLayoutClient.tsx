"use client";

import { useSidebar } from "@/components/layout/SidebarContext";

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div className="mx-auto max-w-7xl py-8 ">
      <div
        className={`min-w-0 transition-all duration-300 ${isOpen ? "lg:ml-54" : "lg:ml-15"}`}
      >
        {children}
      </div>
    </div>
  );
}
