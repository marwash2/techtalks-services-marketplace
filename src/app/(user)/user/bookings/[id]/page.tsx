"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";
import Loader from "@/components/shared/Loader";

type BookingRef =
  | string
  | {
      _id?: string;
      id?: string;
      title?: string;
      businessName?: string;
      name?: string;
      email?: string;
      location?: string;
    };

type BookingDetails = {
  id: string;
  userId: BookingRef;
  providerId: BookingRef;
  serviceId: BookingRef;
  date: string;
  status: string;
  price: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BookingDetailsResponse = {
  success: boolean;
  message?: string;
  data: BookingDetails;
};

function refObject(ref: BookingRef): Record<string, string> | null {
  if (ref && typeof ref === "object") return ref as Record<string, string>;
  return null;
}

function refId(ref: BookingRef) {
  if (typeof ref === "string") return ref;
  return ref?._id || ref?.id || "";
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusStyles(status?: string) {
  const normalized = (status || "").toLowerCase();
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

export default function UserBookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/bookings/${bookingId}`, {
          cache: "no-store",
        });

        const data: BookingDetailsResponse = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch booking details");
        }

        setBooking(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch booking details",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchBookingDetails();
  }, [bookingId]);

  const isOwnBooking = useMemo(() => {
    if (!booking || !session?.user?.id) return false;
    return refId(booking.userId) === session.user.id;
  }, [booking, session?.user?.id]);

  const canCancel = useMemo(() => {
    const value = booking?.status?.toLowerCase();
    return value === "pending" || value === "confirmed";
  }, [booking?.status]);

  async function handleCancelBooking() {
    if (!bookingId || !booking || !canCancel || cancelLoading) return;

    setCancelLoading(true);
    setActionMessage("");

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

      setBooking((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
              updatedAt: new Date().toISOString(),
            }
          : prev,
      );
      setActionMessage("Booking has been cancelled successfully.");
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : "Failed to cancel booking",
      );
    } finally {
      setCancelLoading(false);
    }
  }

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
          Could not load booking details
        </h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  if (!booking || !isOwnBooking) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-700">
          Booking not available
        </h2>
        <p className="mt-2 text-sm text-amber-700">
          This booking either does not exist or does not belong to your account.
        </p>
      </section>
    );
  }

  const user = refObject(booking.userId);
  const provider = refObject(booking.providerId);
  const service = refObject(booking.serviceId);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link
        href="/user/bookings"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      <div className="mt-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Booking Details
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(booking.status)}`}
          >
            {booking.status}
          </span>
          {canCancel && (
            <>
              {showConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">Are you sure?</span>

                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelLoading}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 cursor-pointer transition disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Yes"}
                  </button>

                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-xs border px-2 py-1 rounded  bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                >
                  Cancel Booking
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {actionMessage && (
        <p
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            booking.status === "cancelled"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {actionMessage}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Detail label="Booking ID" value={booking.id} />
        <Detail label="Service / Room" value={service?.title || "-"} />
        <Detail label="Provider" value={provider?.businessName || "-"} />
        <Detail label="Provider Location" value={provider?.location || "-"} />
        <Detail label="Date" value={formatDate(booking.date)} />
        <Detail label="Time" value={formatTime(booking.date)} />
        <Detail label="Price" value={`$${booking.price}`} />
        <Detail label="Booked By" value={user?.name || "-"} />
        <Detail label="User Email" value={user?.email || "-"} />
        <Detail label="Notes" value={booking.notes || "-"} />
        <Detail label="Created At" value={formatDate(booking.createdAt)} />
        <Detail label="Updated At" value={formatDate(booking.updatedAt)} />
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
