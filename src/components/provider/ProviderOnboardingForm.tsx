"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProviderOnboardingFormState = {
  businessName: string;
  location: string;
  description: string;
  avatar: string;
};

const initialFormState: ProviderOnboardingFormState = {
  businessName: "",
  location: "",
  description: "",
  avatar: "",
};

export default function ProviderOnboardingForm() {
  const router = useRouter();
  const [form, setForm] =
    useState<ProviderOnboardingFormState>(initialFormState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: {
        businessName: string;
        location: string;
        description?: string;
        avatar?: string;
      } = {
        businessName: form.businessName.trim(),
        location: form.location.trim(),
      };

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }
      if (form.avatar.trim()) {
        payload.avatar = form.avatar.trim();
      }

      const response = await fetch("/api/providers/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to submit provider profile.");
        setLoading(false);
        return;
      }

      setSuccess("Provider profile complete! Redirecting to your dashboard...");
      setForm(initialFormState);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
            Provider onboarding
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Finish your provider profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-sky-100/90 sm:text-base">
            Complete your service profile to start adding services, managing
            bookings, and appearing in provider search results.
          </p>
        </div>

        <div className="px-6 pb-8 pt-8 sm:px-10 sm:pb-10">
          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-50 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-950">
                Let’s get your provider account ready.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Add your business name and location so customers can find you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Business name
                  </span>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) =>
                      setForm({ ...form, businessName: e.target.value })
                    }
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Example: Home Cleaners"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Location
                  </span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="City, state or region"
                    required
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Short description
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="mt-2 min-h-[120px] w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Tell customers what you do best"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Avatar URL (optional)
                </span>
                <input
                  type="url"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="https://example.com/avatar.jpg"
                />
              </label>

              {error && (
                <p className="rounded-3xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving profile..." : "Complete provider profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
