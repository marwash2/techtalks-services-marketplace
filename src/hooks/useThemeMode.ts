"use client";

import { useCallback, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme-mode";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "dark" ? "dark" : "light";
}

export function useThemeMode() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const initialMode = getStoredThemeMode();
    setMode(initialMode);
    applyTheme(initialMode);
  }, []);

  const updateMode = useCallback((nextMode: ThemeMode) => {
    setMode(nextMode);
    applyTheme(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    window.dispatchEvent(new Event("theme-mode-changed"));
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const current = getStoredThemeMode();
      setMode(current);
      applyTheme(current);
    };
    window.addEventListener("theme-mode-changed", syncTheme);
    return () => window.removeEventListener("theme-mode-changed", syncTheme);
  }, []);

  return { mode, setMode: updateMode };
}
