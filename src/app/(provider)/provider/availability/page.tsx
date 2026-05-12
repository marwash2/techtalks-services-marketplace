"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock4,
  Loader2,
  Plus,
  Save,
  ArrowLeft,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Service = {
  id: string;
  title: string;
  price: number;
  duration: number;
  availability: string;
  category?: { name?: string } | null;
};

type DayKey =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type DaySchedule = {
  day: DayKey;
  enabled: boolean;
  from: string;
  to: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: DayKey[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_FROM = "09:00";
const DEFAULT_TO = "17:00";
const WEEKDAYS: DayKey[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DAY_ALIASES: Record<string, DayKey> = {
  mon: "Monday", monday: "Monday",
  tue: "Tuesday", tuesday: "Tuesday",
  wed: "Wednesday", wednesday: "Wednesday",
  thu: "Thursday", thursday: "Thursday",
  fri: "Friday", friday: "Friday",
  sat: "Saturday", saturday: "Saturday",
  sun: "Sunday", sunday: "Sunday",
};

const DAY_LABELS: Record<DayKey, string> = {
  Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
  Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
};

const DAY_PATTERN =
  "mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?";
const TIME_PATTERN = "\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDayByName(value: string) {
  return DAY_ALIASES[value.trim().toLowerCase()];
}

function getDayIndex(day: DayKey) {
  return DAYS.findIndex((item) => item === day);
}

function parseTimeToInputValue(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);
  if (!match) return null;
  const [, rawHour, rawMinute = "00", period] = match;
  let hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = period === "am" ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12;
  } else if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeForAvailability(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);
  const period = hourValue >= 12 ? "pm" : "am";
  const hour = hourValue % 12 || 12;
  return minuteValue === 0
    ? `${hour}${period}`
    : `${hour}:${String(minuteValue).padStart(2, "0")}${period}`;
}

function getDaysInRange(fromDay: DayKey, toDay?: DayKey) {
  const fromIndex = getDayIndex(fromDay);
  const toIndex = toDay ? getDayIndex(toDay) : fromIndex;
  if (fromIndex === -1 || toIndex === -1 || toIndex < fromIndex) return [fromDay];
  return DAYS.slice(fromIndex, toIndex + 1);
}

function createDefaultSchedule(): DaySchedule[] {
  return DAYS.map((day) => ({
    day,
    enabled: WEEKDAYS.includes(day),
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  }));
}

function parseAvailability(availability: string): DaySchedule[] {
  if (!availability.trim()) return createDefaultSchedule();

  const parsed = createDefaultSchedule().map((item) => ({ ...item, enabled: false }));
  const groupPattern = new RegExp(
    `\\b(${DAY_PATTERN})(?:\\s*-\\s*(${DAY_PATTERN}))?\\s+(${TIME_PATTERN})\\s*-\\s*(${TIME_PATTERN})`,
    "gi",
  );

  for (const match of availability.matchAll(groupPattern)) {
    const [, rawFromDay, rawToDay, rawFrom, rawTo] = match;
    const fromDay = getDayByName(rawFromDay);
    const toDay = rawToDay ? getDayByName(rawToDay) : undefined;
    const from = parseTimeToInputValue(rawFrom);
    const to = parseTimeToInputValue(rawTo);
    if (!fromDay || !from || !to) continue;

    for (const day of getDaysInRange(fromDay, toDay)) {
      const index = parsed.findIndex((item) => item.day === day);
      parsed[index] = { day, enabled: true, from, to };
    }
  }

  return parsed.some((item) => item.enabled) ? parsed : createDefaultSchedule();
}

function formatAvailability(schedule: DaySchedule[]) {
  const enabled = schedule.filter((item) => item.enabled);
  const groups: string[] = [];
  let index = 0;

  while (index < enabled.length) {
    const first = enabled[index];
    let last = first;
    let nextIndex = index + 1;

    while (
      nextIndex < enabled.length &&
      getDayIndex(enabled[nextIndex].day) === getDayIndex(last.day) + 1 &&
      enabled[nextIndex].from === first.from &&
      enabled[nextIndex].to === first.to
    ) {
      last = enabled[nextIndex];
      nextIndex += 1;
    }

    const dayLabel =
      first.day === last.day
        ? DAY_LABELS[first.day]
        : `${DAY_LABELS[first.day]}-${DAY_LABELS[last.day]}`;
    groups.push(
      `${dayLabel} ${formatTimeForAvailability(first.from)}-${formatTimeForAvailability(first.to)}`,
    );
    index = nextIndex;
  }

  return groups.join("; ");
}

function formatTimeRange(schedule: DaySchedule[]) {
  const enabled = schedule.filter((item) => item.enabled);
  if (enabled.length === 0) return "No days selected";
  const first = enabled[0];
  const everyDaySameTime = enabled.every(
    (item) => item.from === first.from && item.to === first.to,
  );
  return everyDaySameTime
    ? `${enabled.length} days · ${first.from} – ${first.to}`
    : `${enabled.length} days · custom hours`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProviderAvailabilityPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [schedule, setSchedule] = useState<DaySchedule[]>(createDefaultSchedule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [selectedServiceId, services],
  );

  const availabilityText = useMemo(() => formatAvailability(schedule), [schedule]);
  const hasInvalidTime = schedule.some((item) => item.enabled && item.from >= item.to);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/services?dashboard=true&limit=100", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || "Failed to load services");

        const providerServices = data.data?.services || [];
        setServices(providerServices);

        if (providerServices.length > 0) {
          const first = providerServices[0];
          setSelectedServiceId(first.id);
          setSchedule(parseAvailability(first.availability || ""));
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleSelectService(service: Service) {
    setSelectedServiceId(service.id);
    setSchedule(parseAvailability(service.availability || ""));
    setHasUnsavedChanges(false);
    setSuccess("");
    setError("");
  }

  function updateDay(day: DayKey, changes: Partial<DaySchedule>) {
    setSchedule((cur) =>
      cur.map((item) => (item.day === day ? { ...item, ...changes } : item)),
    );
    setHasUnsavedChanges(true);
    setSuccess("");
    setError("");
  }

  function applyToWeekdays() {
    setSchedule((cur) =>
      cur.map((item) => ({
        ...item,
        enabled: WEEKDAYS.includes(item.day),
        from: WEEKDAYS.includes(item.day) ? DEFAULT_FROM : item.from,
        to: WEEKDAYS.includes(item.day) ? DEFAULT_TO : item.to,
      })),
    );
    setHasUnsavedChanges(true);
    setSuccess("");
    setError("");
  }

  async function handleSave() {
    if (!selectedService) return;
    if (!availabilityText) { setError("Select at least one available day before saving."); return; }
    if (hasInvalidTime) { setError("Each end time must be later than its start time."); return; }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: availabilityText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to save");

      setServices((cur) =>
        cur.map((s) =>
          s.id === selectedService.id
            ? { ...s, availability: formatAvailability(schedule) }
            : s,
        ),
      );
      setHasUnsavedChanges(false);
      setSuccess("Availability saved successfully.");
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
                Provider
              </p>
              <h1 className="text-3xl font-semibold text-slate-950">
                Availability
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 leading-6 max-w-xl">
                Choose a service, set the days and hours it can be booked, then save.
                Each service keeps its own schedule.
              </p>
            </div>
           
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-[16px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 rounded-[16px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Loading your services…
            </div>
          </div>

        ) : services.length === 0 ? (
          /* Empty state */
          <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <CalendarDays className="h-6 w-6 text-slate-400" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">No services yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Create your first service, then return here to set its booking availability.
            </p>
            <Link
              href="/provider/services/new"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add service
            </Link>
          </div>

        ) : (
          /* Main layout */
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">

            {/* ── Service list sidebar ── */}
            <aside className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden h-fit">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900">Services</h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Each service has its own schedule.
                </p>
              </div>
              <ul className="divide-y divide-slate-50">
                {services.map((service) => {
                  const active = service.id === selectedServiceId;
                  return (
                    <li key={service.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectService(service)}
                        className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                          active ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-slate-900">
                            {service.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {service.category?.name || "Uncategorized"} · {service.duration} min
                          </span>
                        </span>
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active ? "text-blue-600" : "text-slate-300"
                          }`}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* ── Schedule editor ── */}
            <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Editor header */}
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {selectedService?.title}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock4 className="h-3.5 w-3.5" />
                    {formatTimeRange(schedule)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyToWeekdays}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Reset to weekdays 9–5
                </button>
              </div>

              {/* Day rows */}
              <ul className="divide-y divide-slate-50">
                {schedule.map((item) => (
                  <li
                    key={item.day}
                    className={`grid gap-4 px-6 py-4 sm:grid-cols-[180px_1fr] sm:items-center transition-colors ${
                      item.enabled ? "" : "opacity-50"
                    }`}
                  >
                    {/* Day toggle */}
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={(e) => updateDay(item.day, { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="h-5 w-9 rounded-full border border-slate-200 bg-slate-100 peer-checked:border-blue-500 peer-checked:bg-blue-500 transition-colors" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {item.day}
                      </span>
                    </label>

                    {/* Time inputs */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          From
                        </label>
                        <input
                          type="time"
                          value={item.from}
                          disabled={!item.enabled}
                          onChange={(e) => updateDay(item.day, { from: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                          To
                        </label>
                        <input
                          type="time"
                          value={item.to}
                          disabled={!item.enabled}
                          onChange={(e) => updateDay(item.day, { to: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed transition"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Saved as:{" "}
                  <span className="font-semibold text-slate-800">
                    {availabilityText || "No available days"}
                  </span>
                  {hasUnsavedChanges && (
                    <span className="ml-2 font-semibold text-amber-600">
                      · Unsaved changes
                    </span>
                  )}
                </p>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !selectedService || !hasUnsavedChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving…" : "Save availability"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}