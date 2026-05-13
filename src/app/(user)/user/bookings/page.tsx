"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import {
  CalendarDays,
  Clock3,
  MapPin,
  User,
  BadgeCheck,
  XCircle,
  ChevronRight,
  BriefcaseBusiness,
  Sparkles,
  AlertCircle,
  CircleDollarSign,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "pending_payment"
  | "completed"
  | "cancelled"
  | "done";

interface Booking {
  id: string;
  service: { id: string; title: string; price: number; duration?: number };
  provider: { businessName: string; location: string };
  date: string;
  time?: string;
  status: BookingStatus;
  paymentStatus?: string;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: AlertCircle,
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    icon: BadgeCheck,
  },
  pending_payment: {
    label: "Awaiting Payment",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: CircleDollarSign,
  },
  completed: {
    label: "Completed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  done: {
    label: "Completed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    icon: XCircle,
  },
};

const FILTERS: { label: string; value: "all" | BookingStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
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
    if (status === "unauthenticated") {
      router.push("/login");
    }
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
        body: JSON.stringify({ status: "cancelled", actor: "user" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel booking");
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "cancelled" as BookingStatus } : b
        )
      );
      setConfirmId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered =
    activeFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === activeFilter);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-b-2 border-blue-500 animate-spin" />
          <p className="text-sm text-[#6b93c4]">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
        <div className="bg-white border border-red-200 rounded-3xl p-8 text-center">
          <p className="text-red-500 font-medium mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-2 rounded-2xl text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <ClipboardList className="w-3 h-3" />
              My Bookings
            </span>

            <h1
              className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Manage Your Bookings
            </h1>

            <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl mb-6">
              Track appointments, manage service requests, and stay updated with
              all your upcoming and completed bookings.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                {bookings.length} Booking{bookings.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                Confirmed Services
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Professional Providers
              </span>
            </div>
          </div>
        </section>

        {/* TOP ACTION */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              className="text-2xl text-[#1e3a5f] mb-1"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Booking Overview
            </h2>
            <p className="text-sm text-[#6b93c4]">
              Filter and manage all your service bookings
            </p>
          </div>

          <button
            onClick={() => router.push("/services")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-full px-5 py-3 text-sm font-semibold shadow-sm"
          >
            <BriefcaseBusiness className="w-4 h-4" />
            Book a Service
          </button>
        </div>

        {/* SUCCESS */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">
              Booking submitted successfully! We'll notify you once the provider
              responds.
            </p>
          </div>
        )}

        {/* FILTERS */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count = f.value === "all" ? bookings.length : (counts[f.value] ?? 0);
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-[#4b6fa8] border-blue-200 hover:bg-blue-50"
                  }`}
              >
                {f.label}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-blue-500 text-white" : "bg-blue-50 text-[#4b6fa8]"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="bg-white border-[1.5px] border-dashed border-blue-200 rounded-3xl px-6 py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ClipboardList className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
              {activeFilter === "all" ? "No bookings found" : `No ${activeFilter} bookings`}
            </h2>
            <p className="text-sm text-[#6b93c4] leading-relaxed max-w-sm mx-auto">
              {activeFilter === "all"
                ? "You haven't booked any services yet."
                : "Try switching to another booking filter."}
            </p>
            {activeFilter === "all" && (
              <button
                onClick={() => router.push("/services")}
                className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white rounded-full px-5 py-3 text-sm font-semibold"
              >
                Browse Services
              </button>
            )}
          </div>
        )}

        {/* BOOKINGS */}
        <div className="space-y-5">
          {filtered.map((booking) => {
            const isCancelling = cancellingId === booking.id;
            const isConfirming = confirmId === booking.id;
            const cancellable = canCancel(booking.status);
            const needsPayment =
              booking.status === "confirmed" &&
              (booking.paymentStatus === "unpaid" ||
                booking.paymentStatus === "failed" ||
                booking.paymentStatus === "pending");

            return (
              <div
                key={booking.id}
                className={`bg-white border-[1.5px] border-blue-100 rounded-3xl p-6 hover:shadow-md transition ${booking.status === "cancelled" ? "opacity-60" : ""
                  }`}
              >
                {/* TOP */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <BriefcaseBusiness className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1e3a5f] text-lg">
                          {booking.service?.title ?? "Service"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#6b93c4] mt-1">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {booking.provider?.businessName}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.provider?.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={booking.status} />
                    {/* Payment status pill */}
                    {booking.paymentStatus &&
                      booking.paymentStatus !== "unpaid" && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${booking.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.paymentStatus === "failed"
                                ? "bg-red-100 text-red-700"
                                : booking.paymentStatus === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {booking.paymentStatus === "paid"
                            ? "✓ Paid"
                            : booking.paymentStatus}
                        </span>
                      )}
                  </div>
                </div>

                {/* PAY NOW BANNER */}
                {needsPayment && (
                  <div className="mt-3 flex items-center justify-between gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <CircleDollarSign className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-xs text-blue-700 font-medium">
                        Payment required to finalise
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/bookings/${booking.id}/pay`)
                      }
                      className="shrink-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                    >
                      Pay ${booking.service?.price}
                    </button>
                  </div>
                )}

                {/* DETAILS */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <CalendarDays className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Date
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1e3a5f]">
                      {formatDate(booking.date)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <Clock3 className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Time
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1e3a5f]">
                      {booking.time || "Not specified"}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <CircleDollarSign className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Price
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1e3a5f]">
                      ${booking.service?.price}
                    </p>
                  </div>
                </div>

                {/* NOTES */}
                {booking.notes && (
                  <div className="mt-5 border-l-2 border-blue-200 pl-4">
                    <p className="text-sm italic text-[#6b93c4]">
                      "{booking.notes}"
                    </p>
                  </div>
                )}

                {/* FOOTER */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-[#9db7d8]">
                    Booked on{" "}
                    {new Date(booking.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>

                  <div className="flex items-center gap-3">
                    {cancellable &&
                      (isConfirming ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={isCancelling}
                            className="bg-red-500 hover:bg-red-600 transition text-white rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
                          >
                            {isCancelling ? "Cancelling..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="bg-white border border-blue-200 hover:bg-blue-50 transition text-[#4b6fa8] rounded-full px-4 py-2 text-sm font-medium"
                          >
                            Keep Booking
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(booking.id)}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      ))}

                    <button
                      onClick={() =>
                        router.push(`/user/bookings/${booking.id}`)
                      }
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                      View Booking
                      <ChevronRight className="w-4 h-4" />
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