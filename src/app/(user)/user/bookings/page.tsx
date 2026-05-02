"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import Loader from "@/components/shared/Loader";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "done";

type BookingRef =
  | string
  | {
      _id?: string;
      id?: string;
      title?: string;
      businessName?: string;
      name?: string;
    };

type BookingItem = {
  id: string;
  userId: BookingRef;
  providerId: BookingRef;
  serviceId: BookingRef;
  date: string;
  status: BookingStatus;
  price: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BookingsResponse = {
  success: boolean;
  message?: string;
  bookings: BookingItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

function asRefObject(ref: BookingRef): Record<string, string> | null {
  if (ref && typeof ref === "object") return ref as Record<string, string>;
  return null;
}

function getServiceTitle(booking: BookingItem) {
  const ref = asRefObject(booking.serviceId);
  return ref?.title || "Service";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function statusStyles(status: BookingStatus) {
  const normalized = status.toLowerCase();
  if (normalized === "confirmed")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "pending")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (normalized === "completed" || normalized === "done")
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (normalized === "cancelled")
    return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  function canCancel(status: BookingStatus) {
    const value = status.toLowerCase();
    return value === "pending" || value === "confirmed";
  }

  async function handleCancelBooking(bookingId: string) {
    if (cancellingId) return;

    setCancellingId(bookingId);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel booking");
      }

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "cancelled",
                updatedAt: new Date().toISOString(),
              }
            : booking,
        ),
      );

      setConfirmId(null); // ✅ CLOSE confirm UI
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  }

  useEffect(() => {
    async function fetchBookings() {
      if (status !== "authenticated") return;
      if (!userId) {
        setError("Could not identify your account. Please login again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        userId,
        page: String(page),
        limit: "8",
      });
      if (statusFilter) params.set("status", statusFilter);

      try {
        const res = await fetch(`/api/bookings?${params.toString()}`, {
          cache: "no-store",
        });

        const data: BookingsResponse = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch bookings");
        }

        setBookings(data.bookings || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalBookings(data.pagination?.total || 0);
        console.log("BOOKINGS RESPONSE:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch bookings",
        );
      } finally {
        setLoading(false);
      }
    }

    console.log("USER ID:", userId);
    fetchBookings();
  }, [userId, status, page, statusFilter]);

  const hasBookings = useMemo(() => bookings.length > 0, [bookings]);

  if (status === "loading" || loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Loader />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-700">
          Could not load bookings
        </h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Bookings</h2>
          <p className="mt-1 text-sm text-slate-600">
            Showing {bookings.length} of {totalBookings} bookings
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {!hasBookings ? (
        <div className="mt-6">
          <EmptyState
            title="No bookings yet"
            description="You have not made any bookings so far."
          />
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const formatted = formatDateTime(booking.date);
                  return (
                    <tr key={booking.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-800">
                        {getServiceTitle(booking)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatted.date}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatted.time}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* VIEW BUTTON */}
                          <Link
                            href={`/user/bookings/${booking.id}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Link>

                          {/* CANCEL BUTTON ONLY for pending + confirmed */}
                          {(booking.status === "pending" ||
                            booking.status === "confirmed") && (
                            <>
                              {confirmId === booking.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    className="text-xs bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setConfirmId(null)}
                                    className="text-xs border px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmId(booking.id)}
                                  className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 transition cursor-pointer"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
