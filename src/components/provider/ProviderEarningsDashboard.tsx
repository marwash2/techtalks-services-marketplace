"use client";

import { useMemo, useState } from "react";
import { Clock3, DollarSign, ReceiptText } from "lucide-react";

type TransactionItem = {
  id: string;
  serviceTitle: string;
  date: string;
  amount: number;
  status: string;
};

type Props = {
  bookings: TransactionItem[];
};

type StatusFilter = "all" | "pending" | "completed" | "cancelled" | "confirmed";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProviderEarningsDashboard({ bookings }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const completed = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );

  const pending = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings],
  );

  const cancelled = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled"),
    [bookings],
  );

  const confirmed = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed"),
    [bookings],
  );

  const totalEarnings = completed.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  const pendingEarnings = pending.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  const cancelledEarnings = cancelled.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  const confirmedEarnings = confirmed.reduce(
    (sum, booking) => sum + booking.amount,
    0,
  );

  const filteredBookings = useMemo(() => {
    if (filter === "all") return bookings;

    return bookings.filter((booking) => booking.status === filter);
  }, [bookings, filter]);

  const tabs: Array<{
    key: StatusFilter;
    label: string;
    count: number;
  }> = [
    {
      key: "all",
      label: "All",
      count: bookings.length,
    },
    {
      key: "pending",
      label: "Pending",
      count: pending.length,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: cancelled.length,
    },
    {
      key: "confirmed",
      label: "Confirmed",
      count: confirmed.length,
    },
    {
      key: "completed",
      label: "Completed",
      count: completed.length,
    },
  ];
const completedCount = completed.length;
const cancelledCount = cancelled.length;
const pendingCount = pending.length;
  function getTabClass(key: StatusFilter, isActive: boolean) {
    if (!isActive) {
      return "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900";
    }

    if (key === "pending") {
      return "border-amber-100 bg-amber-500 text-white";
    }

    if (key === "cancelled") {
      return "border-red-100 bg-red-600 text-white";
    }

    if (key === "confirmed") {
      return "border-emerald-100 bg-emerald-600 text-white";
    }

    if (key === "completed") {
      return "border-blue-100 bg-blue-600 text-white";
    }

    return "border-slate-900 bg-slate-900 text-white";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
          Finance
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Earnings</h1>

        <p className="mt-2 text-sm text-slate-600">
          See each earning and monitor your overall revenue performance.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* Completed */}
  <article className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-blue-600">
      <DollarSign className="h-4 w-4" />
      <p className="text-sm">Completed earnings</p>
    </div>

    <p className="text-2xl font-semibold text-slate-900">
      ${totalEarnings.toFixed(2)}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      {completedCount} completed bookings
    </p>
  </article>

  {/* Pending */}
  <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-amber-600">
      <Clock3 className="h-4 w-4" />
      <p className="text-sm">Pending earnings</p>
    </div>

    <p className="text-2xl font-semibold text-slate-900">
      ${pendingEarnings.toFixed(2)}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      {pendingCount} pending bookings
    </p>
  </article>

  {/* Cancelled */}
  <article className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
    <div className="mb-2 flex items-center gap-2 text-red-600">
      <ReceiptText className="h-4 w-4" />
      <p className="text-sm">Cancelled earning</p>
    </div>

    <p className="text-2xl font-semibold text-slate-900">
      {cancelledCount}
    </p>

    <p className="mt-1 text-xs text-slate-500">
      cancelled bookings
    </p>
  </article>
</section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Transactions
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${getTabClass(
                  tab.key,
                  filter === tab.key,
                )}`}
              >
                {tab.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    filter === tab.key ? "bg-white/20" : "bg-slate-100"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No {filter === "all" ? "" : filter} transactions yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredBookings.map((booking) => (
              <article
                key={booking.id}
                className="flex items-center justify-between gap-4 px-6 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {booking.serviceTitle}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatDate(booking.date)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${booking.amount.toFixed(2)}
                  </p>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      booking.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : booking.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700"
                          : booking.status === "completed"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-red-50 text-red-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
