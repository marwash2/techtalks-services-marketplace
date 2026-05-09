"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  time?: string;
  status: string;
  price: number;
  notes?: string;
  paymentStatus?: string;
  paidAt?: string | null;
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
    day: "2-digit", month: "short", year: "numeric",
  }).format(new Date(value));
}

function statusStyles(status?: string) {
  const s = (status || "").toLowerCase();
  if (s === "confirmed")       return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "pending")         return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "pending_payment") return "bg-purple-50 text-purple-700 border-purple-200";
  if (s === "completed")       return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "cancelled")       return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function paymentBadgeStyles(status?: string) {
  if (status === "paid")    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "failed")  return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

export default function UserBookingDetailsPage() {
  const params       = useParams<{ id: string }>();
  const bookingId    = params?.id;
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [booking,       setBooking]       = useState<BookingDetails | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showConfirm,   setShowConfirm]   = useState(false);

  // Redirected back from Stripe after successful payment
  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) return;
      setLoading(true);
      setError("");
      try {
        const res  = await fetch(`/api/bookings/${bookingId}`, { cache: "no-store" });
        const data: BookingDetailsResponse = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch booking details");
        setBooking(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch booking details");
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
    const s = booking?.status?.toLowerCase();
    return s === "pending" || s === "confirmed";
  }, [booking?.status]);

  // Show "Pay Now" when confirmed and payment not yet complete
  const canPay = useMemo(() => {
    return (
      booking?.status === "confirmed" &&
      (booking?.paymentStatus === "unpaid" || booking?.paymentStatus === "failed")
    );
  }, [booking?.status, booking?.paymentStatus]);

  async function handleCancelBooking() {
    if (!bookingId || !booking || !canCancel || cancelLoading) return;
    setCancelLoading(true);
    setActionMessage("");
    try {
      const res  = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", actor: "user" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to cancel booking");
      setBooking((prev) => prev ? { ...prev, status: "cancelled", updatedAt: new Date().toISOString() } : prev);
      setActionMessage("Booking has been cancelled successfully.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Failed to cancel booking");
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
        <h2 className="text-lg font-semibold text-rose-700">Could not load booking details</h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  if (!booking || !isOwnBooking) {
    return (
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-amber-700">Booking not available</h2>
        <p className="mt-2 text-sm text-amber-700">
          This booking either does not exist or does not belong to your account.
        </p>
      </section>
    );
  }

  const user     = refObject(booking.userId);
  const provider = refObject(booking.providerId);
  const service  = refObject(booking.serviceId);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">

      <Link
        href="/user/bookings"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      {/* ── Payment success banner (after Stripe redirect) ── */}
      {paymentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">
            Payment successful! Your booking is now complete.
          </p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold text-slate-900">Booking Details</h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Booking status */}
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${statusStyles(booking.status)}`}>
            {booking.status.replace("_", " ")}
          </span>

          {/* Payment status (only show when relevant) */}
          {booking.paymentStatus && booking.paymentStatus !== "unpaid" && (
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${paymentBadgeStyles(booking.paymentStatus)}`}>
              {booking.paymentStatus === "paid" ? "✓ Paid" : booking.paymentStatus}
            </span>
          )}

          {/* Pay Now button (compact, in header) */}
          {canPay && (
            <button
              onClick={() => router.push(`/bookings/${bookingId}/pay`)}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Pay Now
            </button>
          )}

          {/* Cancel button */}
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
                    className="text-xs border px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
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

      {/* ── Pay Now prompt banner (more prominent) ── */}
      {canPay && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-700">
              Your booking is <strong>confirmed</strong> — complete your payment to finalise the appointment.
            </p>
          </div>
          <button
            onClick={() => router.push(`/bookings/${bookingId}/pay`)}
            className="shrink-0 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Pay ${booking.price.toFixed(2)}
          </button>
        </div>
      )}

      {actionMessage && (
        <p className={`rounded-lg px-3 py-2 text-sm ${booking.status === "cancelled" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {actionMessage}
        </p>
      )}

      {/* ── Details grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Detail label="Booking ID"        value={booking.id} />
        <Detail label="Service"           value={service?.title || "-"} />
        <Detail label="Provider"          value={provider?.businessName || "-"} />
        <Detail label="Provider Location" value={provider?.location || "-"} />
        <Detail label="Date"              value={formatDate(booking.date)} />
        <Detail label="Time"              value={booking.time || "-"} />
        <Detail label="Price"             value={`$${booking.price}`} />
        <Detail label="Payment Status"    value={booking.paymentStatus ?? "unpaid"} />
        {booking.paidAt && (
          <Detail label="Paid At" value={formatDate(booking.paidAt)} />
        )}
        <Detail label="Booked By"  value={user?.name  || "-"} />
        <Detail label="User Email" value={user?.email || "-"} />
        <Detail label="Notes"      value={booking.notes || "-"} />
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
      <p className="mt-1 text-sm font-medium text-slate-900 capitalize">{value}</p>
    </div>
  );
}