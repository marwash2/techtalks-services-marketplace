"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  MapPin,
  User,
  Mail,
  FileText,
  CircleDollarSign,
  ClipboardList,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  Sparkles,
  RefreshCcw,
} from "lucide-react";

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

function statusConfig(status?: string) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "confirmed") {
    return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: BadgeCheck };
  }
  if (normalized === "pending") {
    return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle };
  }
  if (normalized === "pending_payment") {
    return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: CircleDollarSign };
  }
  if (normalized === "completed" || normalized === "done") {
    return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: CheckCircle2 };
  }
  if (normalized === "cancelled") {
    return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: XCircle };
  }
  return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: ClipboardList };
}

function paymentBadgeStyles(status?: string) {
  if (status === "paid") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "failed") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

export default function UserBookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const bookingId = params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirected back from Stripe after successful payment
  const paymentSuccess = searchParams.get("payment") === "success";

  useEffect(() => {
    async function fetchBookingDetails() {
      if (!bookingId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/bookings/${bookingId}`, { cache: "no-store" });
        const data: BookingDetailsResponse = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch booking details");
        }
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

  const canPay = useMemo(() => {
    return (
      booking?.status === "confirmed" &&
      (booking?.paymentStatus === "unpaid" ||
        booking?.paymentStatus === "failed" ||
        booking?.paymentStatus === "pending")
    );
  }, [booking?.status, booking?.paymentStatus]);

  async function handleCancelBooking() {
    if (!bookingId || !booking || !canCancel || cancelLoading) return;
    setCancelLoading(true);
    setActionMessage("");
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", actor: "user" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel booking");
      }
      setBooking((prev) =>
        prev ? { ...prev, status: "cancelled", updatedAt: new Date().toISOString() } : prev
      );
      setActionMessage("Booking has been cancelled successfully.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center">
        <div className="bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to Load Booking</h2>
          <p className="text-sm text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full px-5 py-3 text-sm font-semibold"
          >
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!booking || !isOwnBooking) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center px-4">
        <div className="bg-white border border-amber-200 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Booking Not Available</h2>
          <p className="text-sm text-[#6b93c4]">
            This booking either does not exist or does not belong to your account.
          </p>
        </div>
      </div>
    );
  }

  const user = refObject(booking.userId);
  const provider = refObject(booking.providerId);
  const service = refObject(booking.serviceId);

  const statusStyle = statusConfig(booking.status);
  const StatusIcon = statusStyle.icon;

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">
            <Link
              href="/user/bookings"
              className="inline-flex items-center gap-2 bg-white border border-blue-200 hover:bg-blue-50 transition rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f] mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Bookings
            </Link>

            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <ClipboardList className="w-3 h-3" />
              Booking Details
            </span>

            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <h1
                  className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {service?.title || "Service Booking"}
                </h1>
                <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl">
                  View all details related to your service booking including provider, pricing,
                  schedule, and status updates.
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {booking.status.replace("_", " ")}
                </div>

                {/* Payment status pill */}
                {booking.paymentStatus && booking.paymentStatus !== "unpaid" && (
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${paymentBadgeStyles(booking.paymentStatus)}`}
                  >
                    {booking.paymentStatus === "paid" ? "✓ Paid" : booking.paymentStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-8">
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                {formatDate(booking.date)}
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <CircleDollarSign className="w-4 h-4 text-green-500" />
                ${booking.price}
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Professional Service
              </span>
            </div>
          </div>
        </section>

        {/* PAYMENT SUCCESS BANNER */}
        {paymentSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">
              Payment successful! Your booking is now complete.
            </p>
          </div>
        )}

        {/* PAY NOW BANNER */}
        {canPay && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-sm text-blue-700 font-medium">
                Your booking is <strong>confirmed</strong> — complete your payment to finalise
                the appointment.
              </p>
            </div>
            <button
              onClick={() => router.push(`/bookings/${bookingId}/pay`)}
              className="shrink-0 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition cursor-pointer whitespace-nowrap"
            >
              Pay ${booking.price.toFixed(2)}
            </button>
          </div>
        )}

        {/* ACTION MESSAGE */}
        {actionMessage && (
          <div
            className={`rounded-2xl px-5 py-4 text-sm font-medium ${booking.status === "cancelled"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
              }`}
          >
            {actionMessage}
          </div>
        )}

        {/* MAIN DETAILS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-5">

            {/* SERVICE INFO */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2
                    className="text-2xl text-[#1e3a5f]"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Service Information
                  </h2>
                  <p className="text-sm text-[#6b93c4]">Booking and provider details</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <DetailCard icon={ClipboardList} label="Booking ID" value={booking.id} />
                <DetailCard icon={BriefcaseBusiness} label="Service" value={service?.title || "-"} />
                <DetailCard icon={User} label="Provider" value={provider?.businessName || "-"} />
                <DetailCard icon={MapPin} label="Location" value={provider?.location || "-"} />
                <DetailCard icon={CalendarDays} label="Date" value={formatDate(booking.date)} />
                <DetailCard icon={Clock3} label="Time" value={booking.time || formatTime(booking.date)} />
                <DetailCard icon={CircleDollarSign} label="Price" value={`$${booking.price}`} />
                <DetailCard icon={CircleDollarSign} label="Payment" value={booking.paymentStatus ?? "unpaid"} />
                {booking.paidAt && (
                  <DetailCard icon={CheckCircle2} label="Paid At" value={formatDate(booking.paidAt)} />
                )}
                <DetailCard icon={User} label="Booked By" value={user?.name || "-"} />
                <DetailCard icon={Mail} label="User Email" value={user?.email || "-"} />
                <DetailCard icon={CalendarDays} label="Created At" value={formatDate(booking.createdAt)} />
                <DetailCard icon={RefreshCcw} label="Updated At" value={formatDate(booking.updatedAt)} />
              </div>
            </div>

            {/* NOTES */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2
                    className="text-2xl text-[#1e3a5f]"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Additional Notes
                  </h2>
                  <p className="text-sm text-[#6b93c4]">Special instructions or details</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <p className="text-sm leading-relaxed text-[#4b6fa8] italic">
                  {booking.notes || "No additional notes were added for this booking."}
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">

            {/* STATUS CARD */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">
              <div className="text-center">
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5 ${statusStyle.bg}`}
                >
                  <StatusIcon className={`w-9 h-9 ${statusStyle.text}`} />
                </div>
                <h2
                  className="text-2xl text-[#1e3a5f] mb-2 capitalize"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {booking.status.replace("_", " ")}
                </h2>
                <p className="text-sm text-[#6b93c4] leading-relaxed">
                  Your booking is currently marked as{" "}
                  <span className="font-semibold capitalize">
                    {booking.status.replace("_", " ")}
                  </span>
                  .
                </p>
              </div>

              {canCancel && (
                <div className="mt-6">
                  {showConfirm ? (
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                        <p className="text-sm text-red-600 font-medium">
                          Are you sure you want to cancel this booking?
                        </p>
                      </div>
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelLoading}
                        className="w-full bg-red-500 hover:bg-red-600 transition text-white rounded-2xl py-3 text-sm font-semibold disabled:opacity-50"
                      >
                        {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        className="w-full bg-white border border-blue-200 hover:bg-blue-50 transition text-[#1e3a5f] rounded-2xl py-3 text-sm font-medium"
                      >
                        Keep Booking
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirm(true)}
                      className="w-full bg-red-500 hover:bg-red-600 transition text-white rounded-2xl py-3 text-sm font-semibold"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3 text-blue-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-medium text-[#1e3a5f] break-words">{value}</p>
    </div>
  );
}