export type ThemeMode = "light" | "dark";

export type UserPreferences = {
  mode: ThemeMode;
  notificationsEnabled: boolean;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  mode: "light",
  notificationsEnabled: true,
};

function getPreferenceKey(userId?: string | null) {
  return `settings-preferences-${userId ?? "guest"}`;
}

export function readUserPreferences(userId?: string | null): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  const key = getPreferenceKey(userId);
  const raw = window.localStorage.getItem(key);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      mode: parsed.mode === "dark" ? "dark" : "light",
      notificationsEnabled:
        typeof parsed.notificationsEnabled === "boolean"
          ? parsed.notificationsEnabled
          : true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writeUserPreferences(
  preferences: UserPreferences,
  userId?: string | null,
) {
  if (typeof window === "undefined") return;

  const key = getPreferenceKey(userId);
  window.localStorage.setItem(key, JSON.stringify(preferences));
  window.dispatchEvent(new Event("user-preferences-changed"));
}

export function getDefaultPreferences() {
  return DEFAULT_PREFERENCES;
}

