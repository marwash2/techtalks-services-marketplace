"use client";

import { useEffect } from "react";
import { getStoredThemeMode } from "@/hooks/useThemeMode";

export default function ThemeInitializer() {
  useEffect(() => {
    const mode = getStoredThemeMode();
    document.documentElement.setAttribute("data-theme", mode);
  }, []);

  return null;
}

