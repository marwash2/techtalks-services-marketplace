"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BecomeProviderButtons() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    router.push("/register?role=provider");
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/providers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upgrade account");
      }

      await update();
      router.refresh();
      router.push("/provider/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <button
        onClick={handleRegister}
        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
      >
        Register to Become a Provider
      </button>
    );
  }

  if (session.user.role === "provider") {
    return (
      <button
        onClick={() => router.push("/provider/dashboard")}
        className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
      >
        Go to Dashboard
      </button>
    );
  }

  if (session.user.role === "admin") {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-500">
          Admin accounts cannot be converted to provider accounts.
        </p>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="w-full bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-slate-800 transition shadow-lg"
        >
          Go to Admin Panel
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-60"
      >
        {loading ? "Updating role..." : "Become a Provider"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
