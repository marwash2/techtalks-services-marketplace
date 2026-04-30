"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarDays, Clock4, CheckCircle2 } from "lucide-react";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STORAGE_KEY = "provider_availability_settings";

function formatTime(value: string) {
  return value;
}

export default function ProviderAvailabilityPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || "guest";

  const loadAvailability = () => {
    if (typeof window === "undefined") return null;

    try {
      const savedValue = window.localStorage.getItem(
        `${STORAGE_KEY}_${userId}`,
      );
      if (!savedValue) return null;
      return JSON.parse(savedValue);
    } catch {
      return null;
    }
  };

  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const savedAvailability = loadAvailability();
    return (
      savedAvailability?.selectedDays ?? [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ]
    );
  });
  const [fromTime, setFromTime] = useState(() => {
    const savedAvailability = loadAvailability();
    return savedAvailability?.fromTime ?? "09:00";
  });
  const [toTime, setToTime] = useState(() => {
    const savedAvailability = loadAvailability();
    return savedAvailability?.toTime ?? "18:00";
  });
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    );
    setSaved(false);
  };

  const handleSave = () => {
    const payload = { selectedDays, fromTime, toTime };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        `${STORAGE_KEY}_${userId}`,
        JSON.stringify(payload),
      );
    }
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">
                Manage Availability
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
                Set your working hours and days.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                Choose which days you are available for bookings and define your
                daily schedule.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <CalendarDays className="h-5 w-5 text-sky-600" />
                Availability summary
              </div>
              <p className="mt-2 text-sm">
                {selectedDays.length} days selected · {formatTime(fromTime)} -{" "}
                {formatTime(toTime)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Working Days
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Select the days you are available for bookings.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {daysOfWeek.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition ${active ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium text-slate-900">{day}</span>
                      <span
                        className={`inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-2xl text-sm font-semibold ${active ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-500"}`}
                      >
                        {active ? "On" : "Off"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Clock4 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Working Hours
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Set your daily start and end times for booking availability.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">From</span>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(event) => {
                    setFromTime(event.target.value);
                    setSaved(false);
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">To</span>
                <input
                  type="time"
                  value={toTime}
                  onChange={(event) => {
                    setToTime(event.target.value);
                    setSaved(false);
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Your availability will be used for customer booking requests.
                </p>
                {saved && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Saved successfully
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
