"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "done";

interface Booking {
  id: string;
  service: { id: string; title: string; price: number; duration?: number };
  provider: { businessName: string; location: string };
  date: string;
  time?: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, {
  label: string; bg: string; text: string; dot: string; border: string;
}> = {
  pending:   { label: "Pending",   bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400", border: "border-yellow-200" },
  confirmed: { label: "Confirmed", bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500",  border: "border-green-200"  },
  completed: { label: "Completed", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200"   },
  done:      { label: "Completed", bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200"   },
  cancelled: { label: "Cancelled", bg: "bg-gray-100",  text: "text-gray-500",   dot: "bg-gray-400",   border: "border-gray-200"   },
};

const FILTERS: { label: string; value: "all" | BookingStatus }[] = [
  { label: "All",       value: "all"       },
  { label: "Pending",   value: "pending"   },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function canCancel(status: BookingStatus): boolean {
  const v = status.toLowerCase();
  return v === "pending" || v === "confirmed";
}

export default function UserBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | BookingStatus>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const showSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings?userId=${session.user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to load bookings");
        setBookings(data.data?.bookings ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [session?.user?.id]);

  const handleCancel = async (bookingId: string) => {
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to cancel booking");

      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" as BookingStatus } : b)
      );
      setConfirmId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = activeFilter === "all" ? bookings : bookings.filter((b) => b.status === activeFilter);
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm tracking-wide">Loading your bookings…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="text-blue-600 underline text-sm cursor-pointer">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {bookings.length} total booking{bookings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/services")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book a Service
          </button>
        </div>

        {/* Success Banner */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">
              Booking submitted! We'll notify you when the provider responds.
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const count = f.value === "all" ? bookings.length : (counts[f.value] ?? 0);
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-gray-800 font-semibold">
              {activeFilter === "all" ? "No bookings yet" : `No ${activeFilter} bookings`}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {activeFilter === "all"
                ? "Browse services and make your first booking."
                : "Try a different filter."}
            </p>
            {activeFilter === "all" && (
              <button
                onClick={() => router.push("/services")}
                className="mt-4 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition cursor-pointer"
              >
                Browse Services
              </button>
            )}
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {filtered.map((booking) => {
            const isCancelling = cancellingId === booking.id;
            const isConfirming = confirmId === booking.id;
            const cancellable = canCancel(booking.status);

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
                  booking.status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {booking.service?.title ?? "Service"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {booking.provider?.businessName ?? "Provider"}
                      <span className="text-gray-300">·</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {booking.provider?.location}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-gray-100" />

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  {booking.time && (
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{booking.time}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-800">${booking.service?.price}</span>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <p className="mt-3 text-sm text-gray-400 line-clamp-1 italic border-l-2 border-gray-200 pl-3">
                    "{booking.notes}"
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    Booked {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                  <div className="flex items-center gap-2">
                    {cancellable && (
                      isConfirming ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={isCancelling}
                            className="text-xs bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer disabled:opacity-50"
                          >
                            {isCancelling ? "Cancelling…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs border px-2 py-1 rounded text-gray-600 hover:bg-gray-50 cursor-pointer"
                          >
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(booking.id)}
                          className="text-sm text-red-600 font-medium hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                      )
                    )}
                    <button
                      onClick={() => router.push(`/services/${booking.service?.id}`)}
                      className="text-sm text-blue-600 font-medium hover:underline cursor-pointer flex items-center gap-1"
                    >
                      View Service
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
