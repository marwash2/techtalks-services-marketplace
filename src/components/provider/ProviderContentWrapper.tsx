"use client";

import { ReactNode } from "react";
import { useSidebar } from "@/components/layout/SidebarContext";

export default function ProviderContentWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen } = useSidebar();

  return (
    <div
      className={`transition-all duration-300 ${isOpen ? "lg:ml-54" : "lg:ml-15"}`}
    >
      {children}
    </div>
  );
}
