"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, Bell, Check, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeMode, useThemeMode } from "@/hooks/useThemeMode";
import {
  readUserPreferences,
  writeUserPreferences,
} from "@/lib/user-preferences";

type SettingsPageProps = {
  accent: "blue" | "emerald";
};

function accentStyles(accent: "blue" | "emerald") {
  if (accent === "emerald") {
    return {
      ring: "border-emerald-500",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: "bg-emerald-50 text-emerald-600",
      switch: "bg-emerald-600",
    };
  }
  return {
    ring: "border-blue-500",
    button: "bg-blue-600 hover:bg-blue-700",
    icon: "bg-blue-50 text-blue-600",
    switch: "bg-blue-600",
  };
}

export default function SettingsPage({ accent }: SettingsPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { mode, setMode } = useThemeMode();
  const styles = accentStyles(accent);

  const [savedNotifications, setSavedNotifications] = useState(true);
  const [draftNotifications, setDraftNotifications] = useState(true);
  const [savedMode, setSavedMode] = useState<ThemeMode>("light");
  const [draftMode, setDraftMode] = useState<ThemeMode>("light");
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeletedModal, setShowDeletedModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userId = session?.user?.id ?? "guest";

  useEffect(() => {
    const prefs = readUserPreferences(userId);
    setSavedMode(prefs.mode);
    setDraftMode(prefs.mode);
    setSavedNotifications(prefs.notificationsEnabled);
    setDraftNotifications(prefs.notificationsEnabled);
    setMode(prefs.mode);
  }, [userId, setMode]);

  const hasPendingChanges =
    savedNotifications !== draftNotifications || savedMode !== draftMode;

  const saveSettings = async () => {
    if (!hasPendingChanges || isSaving) return;

    setIsSaving(true);
    try {
      writeUserPreferences(
        {
          mode: draftMode,
          notificationsEnabled: draftNotifications,
        },
        userId,
      );
      window.localStorage.setItem("theme-mode", draftMode);
      window.dispatchEvent(new Event("theme-mode-changed"));

      setSavedMode(draftMode);
      setSavedNotifications(draftNotifications);
      setMode(draftMode);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const userId = session?.user?.id;
    if (!userId || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
      setShowDeleteModal(false);
      setShowDeletedModal(true);
    } catch {
      setIsDeleting(false);
      window.alert("Unable to delete the account right now. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] shadow-sm">
        <div className="flex items-center gap-4 border-b border-[var(--border-color)] px-6 py-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Settings</h1>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--surface-2)] p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${styles.icon}`}>
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Notifications</p>
                <p className="text-sm text-[var(--foreground)]/70">Turn notifications on or off</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDraftNotifications((prev) => !prev)}
              className={`relative h-7 w-12 rounded-full transition ${
                draftNotifications ? styles.switch : "bg-slate-300"
              }`}
              aria-label="Toggle notifications"
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  draftNotifications ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-2)] p-4">
            <div className="mb-3">
              <p className="font-semibold">Theme Mode</p>
              <p className="text-sm text-[var(--foreground)]/70">Choose light or dark appearance</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDraftMode("light")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  draftMode === "light"
                    ? `${styles.ring} bg-white text-slate-900`
                    : "border-[var(--border-color)] bg-transparent text-[var(--foreground)]/80 hover:bg-slate-50"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setDraftMode("dark")}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  draftMode === "dark"
                    ? `${styles.ring} bg-white text-slate-900`
                    : "border-[var(--border-color)] bg-transparent text-[var(--foreground)]/80 hover:bg-slate-50"
                }`}
              >
                Dark
              </button>
            </div>
            <div className="mt-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-1)] p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-sky-400" />
                <span className="h-3 w-3 rounded-full bg-slate-300" />
                <span className="text-xs text-[var(--foreground)]/70">
                  Preview: {draftMode === "dark" ? "Dark" : "Light"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={!hasPendingChanges || isSaving}
            className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${styles.button} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={`flex w-full items-center justify-between rounded-xl border ${styles.ring} bg-[var(--surface-2)] p-4 text-left transition hover:opacity-90`}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-50 p-2 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Delete Account</p>
                <p className="text-sm text-[var(--foreground)]/70">
                  Permanently delete your account and all data
                </p>
              </div>
            </div>
            <span className="text-xl text-[var(--foreground)]/70">{">"}</span>
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="ml-auto block rounded-full p-1 text-[var(--foreground)]/70 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-50 p-3 text-red-600">
                <Trash2 className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-center text-2xl font-semibold">Delete Account</h2>
            <p className="mt-4 text-center text-[var(--foreground)]/80">
              Are you sure you want to delete your account? This action cannot be
              undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletedModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--surface-1)] p-6 shadow-xl">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-auto block rounded-full p-1 text-[var(--foreground)]/70 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                <Check className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-center text-2xl font-semibold">Account Deleted</h2>
            <p className="mt-4 text-center text-[var(--foreground)]/80">
              Your account has been successfully deleted.
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`mt-6 w-full rounded-lg px-4 py-2 font-medium text-white ${styles.button}`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
