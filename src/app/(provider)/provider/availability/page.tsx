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
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  price: number;
  duration: number;
  availability: string;
  category?: {
    name?: string;
  } | null;
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

const DAY_ALIASES: Record<string, DayKey> = {
  mon: "Monday",
  monday: "Monday",
  tue: "Tuesday",
  tuesday: "Tuesday",
  wed: "Wednesday",
  wednesday: "Wednesday",
  thu: "Thursday",
  thursday: "Thursday",
  fri: "Friday",
  friday: "Friday",
  sat: "Saturday",
  saturday: "Saturday",
  sun: "Sunday",
  sunday: "Sunday",
};

const DAY_LABELS: Record<DayKey, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const DAY_PATTERN =
  "mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?";
const TIME_PATTERN = "\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?";

function getDayByName(value: string) {
  return DAY_ALIASES[value.trim().toLowerCase()];
}

function getDayIndex(day: DayKey) {
  return DAYS.findIndex((item) => item === day);
}

function parseTimeToInputValue(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?$/);

  if (!match) {
    return null;
  }

  const [, rawHour, rawMinute = "00", period] = match;
  let hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) {
    return null;
  }

  if (period) {
    if (hour < 1 || hour > 12) {
      return null;
    }

    if (period === "am") {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
  } else if (hour > 23) {
    return null;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatTimeForAvailability(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);
  const period = hourValue >= 12 ? "pm" : "am";
  const hour = hourValue % 12 || 12;

  if (minuteValue === 0) {
    return `${hour}${period}`;
  }

  return `${hour}:${String(minuteValue).padStart(2, "0")}${period}`;
}

function getDaysInRange(fromDay: DayKey, toDay?: DayKey) {
  const fromIndex = getDayIndex(fromDay);
  const toIndex = toDay ? getDayIndex(toDay) : fromIndex;

  if (fromIndex === -1 || toIndex === -1 || toIndex < fromIndex) {
    return [fromDay];
  }

  return DAYS.slice(fromIndex, toIndex + 1);
}

function createDefaultSchedule(): DaySchedule[] {
  return DAYS.map((day) => ({
    day,
    enabled: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
      day,
    ),
    from: DEFAULT_FROM,
    to: DEFAULT_TO,
  }));
}

function parseAvailability(availability: string): DaySchedule[] {
  const schedule = createDefaultSchedule();

  if (!availability.trim()) {
    return schedule;
  }

  const parsed = createDefaultSchedule().map((item) => ({
    ...item,
    enabled: false,
  }));
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

    if (!fromDay || !from || !to) {
      continue;
    }

    for (const day of getDaysInRange(fromDay, toDay)) {
      const index = parsed.findIndex((item) => item.day === day);
      parsed[index] = {
        day,
        enabled: true,
        from,
        to,
      };
    }
  }

  return parsed.some((item) => item.enabled) ? parsed : schedule;
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
      `${dayLabel} ${formatTimeForAvailability(first.from)}-${formatTimeForAvailability(
        first.to,
      )}`,
    );
    index = nextIndex;
  }

  return groups.join("; ");
}

function formatTimeRange(schedule: DaySchedule[]) {
  const enabled = schedule.filter((item) => item.enabled);

  if (enabled.length === 0) {
    return "No days selected";
  }

  const first = enabled[0];
  const everyDaySameTime = enabled.every(
    (item) => item.from === first.from && item.to === first.to,
  );

  if (everyDaySameTime) {
    return `${enabled.length} days, ${first.from} - ${first.to}`;
  }

  return `${enabled.length} days, custom hours`;
}

export default function ProviderAvailabilityPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    createDefaultSchedule,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) || null,
    [selectedServiceId, services],
  );

  const availabilityText = useMemo(
    () => formatAvailability(schedule),
    [schedule],
  );

  const hasInvalidTime = schedule.some(
    (item) => item.enabled && item.from >= item.to,
  );

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/services?dashboard=true&limit=100", {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || data.message || "Failed to load services",
          );
        }

        const providerServices = data.data?.services || [];
        setServices(providerServices);

        if (providerServices.length > 0) {
          const firstService = providerServices[0];
          const firstSchedule = parseAvailability(
            firstService.availability || "",
          );
          setSelectedServiceId(firstService.id);
          setSchedule(firstSchedule);
          setHasUnsavedChanges(false);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading services",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelectService = (service: Service) => {
    const serviceSchedule = parseAvailability(service.availability || "");
    setSelectedServiceId(service.id);
    setSchedule(serviceSchedule);
    setHasUnsavedChanges(false);
    setSuccess("");
    setError("");
  };

  const updateDay = (day: DayKey, changes: Partial<DaySchedule>) => {
    setSchedule((current) =>
      current.map((item) =>
        item.day === day
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
    setHasUnsavedChanges(true);
    setSuccess("");
    setError("");
  };

  const applyToWeekdays = () => {
    setSchedule((current) =>
      current.map((item) => ({
        ...item,
        enabled: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ].includes(item.day),
        from: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
          item.day,
        )
          ? DEFAULT_FROM
          : item.from,
        to: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(
          item.day,
        )
          ? DEFAULT_TO
          : item.to,
      })),
    );
    setHasUnsavedChanges(true);
    setSuccess("");
    setError("");
  };

  const handleSave = async () => {
    if (!selectedService) {
      return;
    }

    if (!availabilityText) {
      setError("Select at least one available day before saving.");
      return;
    }

    if (hasInvalidTime) {
      setError("Each end time must be later than its start time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          availability: availabilityText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || data.message || "Failed to save availability",
        );
      }

      const savedAvailability = formatAvailability(schedule);
      setServices((current) =>
        current.map((service) =>
          service.id === selectedService.id
            ? {
                ...service,
                availability: savedAvailability,
              }
            : service,
        ),
      );
      setHasUnsavedChanges(false);
      setSuccess("Availability saved for this service.");
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving availability",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Provider availability
            </p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950">
              Set availability by service
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Choose a service, select the days it can be booked, and save the
              working hours for that service only.
            </p>
          </div>

          <Link
            href="/provider/services/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add service
          </Link>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Loading your services...
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-950">
              No services yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
              Create your first service, then return here to set its booking
              availability.
            </p>
            <Link
              href="/provider/services/new"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add service
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-950">Services</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Each service keeps its own schedule.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {services.map((service) => {
                  const active = service.id === selectedServiceId;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleSelectService(service)}
                      className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition ${
                        active ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-gray-950">
                          {service.title}
                        </span>
                        <span className="mt-1 block truncate text-sm text-gray-500">
                          {service.category?.name || "Uncategorized"} -{" "}
                          {service.duration} min
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 ${
                          active ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">
                    {selectedService?.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Clock4 className="h-4 w-4" />
                    {formatTimeRange(schedule)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={applyToWeekdays}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Weekdays 9-5
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {schedule.map((item) => (
                  <div
                    key={item.day}
                    className="grid gap-4 px-5 py-4 sm:grid-cols-[160px_1fr] sm:items-center"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={(event) =>
                          updateDay(item.day, {
                            enabled: event.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-950">
                        {item.day}
                      </span>
                    </label>

                    <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          From
                        </span>
                        <input
                          type="time"
                          value={item.from}
                          disabled={!item.enabled}
                          onChange={(event) =>
                            updateDay(item.day, {
                              from: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          To
                        </span>
                        <input
                          type="time"
                          value={item.to}
                          disabled={!item.enabled}
                          onChange={(event) =>
                            updateDay(item.day, {
                              to: event.target.value,
                            })
                          }
                          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Saved as:{" "}
                  <span className="font-medium text-gray-950">
                    {availabilityText || "No available days"}
                  </span>
                  {hasUnsavedChanges && (
                    <span className="ml-2 font-semibold text-blue-600">
                      Unsaved changes
                    </span>
                  )}
                </p>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !selectedService || !hasUnsavedChanges}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save availability"}
                </button>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
