"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "done"
  | "cancelled";

type Booking = {
  id?: string;
  _id: string;
  userId: any;
  serviceId: any;
  service?: {
    id?: string;
    title?: string;
    price?: number;
    duration?: number;
  };
  date: string;
  time?: string;
  price: number;
  notes?: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
};

const tabs = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function truncateNote(
  text?: string,
  limit = 80
) {
  if (!text) return "No notes";
  return text.length > limit
    ? `${text.slice(0, limit)}...`
    : text;
}

export default function ProviderBookingsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<
    Booking[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [selectedBooking, setSelectedBooking] =
    useState<Booking | null>(null);

  const providerId = session?.user?.id;

  async function fetchBookings() {
    if (!providerId) return;

    try {
      setLoading(true);

      const res = await fetch(
        `/api/bookings?providerId=${providerId}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      setBookings(
        data.data?.bookings ||
          data.bookings ||
          []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings();
  }, [providerId]);

  async function updateStatus(
    bookingId: string,
    status: BookingStatus
  ) {
    try {
      const res = await fetch(
        `/api/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
            actor: "provider",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          (b.id || b._id) === bookingId
            ? { ...b, status }
            : b
        )
      );
    } catch (error) {
      console.error(error);
    }
  }

  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (activeTab !== "all") {
      result = result.filter((booking) =>
        activeTab === "completed"
          ? booking.status ===
              "completed" ||
            booking.status === "done"
          : booking.status === activeTab
      );
    }

    if (search.trim()) {
      result = result.filter((booking) =>
        booking.notes
          ?.toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    return result;
  }, [bookings, activeTab, search]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(
      (b) => b.status === "pending"
    ).length,
    confirmed: bookings.filter(
      (b) => b.status === "confirmed"
    ).length,
    completed: bookings.filter(
      (b) =>
        b.status === "completed" ||
        b.status === "done"
    ).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
            Provider
          </p>

          <h1 className="text-3xl font-semibold text-slate-950">
            Bookings
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 leading-6 max-w-xl">
            Manage booking requests and
            respond to client appointments.
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total"
            value={stats.total}
            icon={
              <CalendarDays className="h-5 w-5 text-blue-600" />
            }
          />

          <StatCard
            title="Pending"
            value={stats.pending}
            icon={
              <Clock3 className="h-5 w-5 text-amber-600" />
            }
          />

          <StatCard
            title="Confirmed"
            value={stats.confirmed}
            icon={
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            }
          />

          <StatCard
            title="Completed"
            value={stats.completed}
            icon={
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            }
          />
        </div>

        {/* FILTERS */}
        <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tab === "all"
                    ? "All"
                    : tab}
                </button>
              ))}
            </div>

            {/* search */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search bookings..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* BOOKINGS */}
        <div className="space-y-4">

          {loading && (
            <div className="flex min-h-[300px] items-center justify-center rounded-[22px] border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                Loading bookings...
              </div>
            </div>
          )}

          {!loading &&
            filteredBookings.length ===
              0 && (
              <div className="rounded-[22px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-300 mb-4" />

                <h2 className="text-base font-semibold text-slate-900">
                  No bookings found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Bookings will appear here
                  once clients start booking.
                </p>
              </div>
            )}

          {filteredBookings.map(
            (booking) => (
              <BookingCard
                key={
                  booking.id ||
                  booking._id
                }
                booking={booking}
                onViewDetails={() =>
                  setSelectedBooking(
                    booking
                  )
                }
                onAccept={() =>
                  updateStatus(
                    booking.id ||
                      booking._id,
                    "confirmed"
                  )
                }
                onReject={() =>
                  updateStatus(
                    booking.id ||
                      booking._id,
                    "cancelled"
                  )
                }
                onComplete={() =>
                  updateStatus(
                    booking.id ||
                      booking._id,
                    "completed"
                  )
                }
              />
            )
          )}
        </div>

        {selectedBooking && (
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() =>
              setSelectedBooking(null)
            }
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>

      <h3 className="text-3xl font-semibold text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {title}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  const styles = {
    pending:
      "bg-amber-100 text-amber-700",
    confirmed:
      "bg-emerald-100 text-emerald-700",
    completed:
      "bg-indigo-100 text-indigo-700",
    done: "bg-indigo-100 text-indigo-700",
    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function BookingCard({
  booking,
  onViewDetails,
  onAccept,
  onReject,
  onComplete,
}: {
  booking: Booking;
  onViewDetails: () => void;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const userName =
    booking.userId &&
    typeof booking.userId === "object"
      ? booking.userId.name ||
        booking.userId.email
      : booking.userId;

  const serviceTitle =
    booking.service?.title ||
    (booking.serviceId &&
    typeof booking.serviceId ===
      "object"
      ? booking.serviceId.title
      : booking.serviceId);

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-sm transition hover:border-blue-200">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* LEFT */}
        <div className="flex-1">

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              {serviceTitle || "Service"}
            </h2>

            <StatusBadge
              status={booking.status}
            />
          </div>

          <div className="space-y-1.5 text-sm text-slate-500">
            <p>
              Client:{" "}
              <span className="text-slate-700 font-medium">
                {String(userName || "-")}
              </span>
            </p>

            <p>
              Date:{" "}
              <span className="text-slate-700 font-medium">
                {new Date(
                  booking.date
                ).toLocaleDateString()}
              </span>
            </p>

            <p>
              Price:{" "}
              <span className="text-slate-700 font-medium">
                ${booking.price}
              </span>
            </p>

            <p className="max-w-2xl">
              Notes:{" "}
              <span className="text-slate-700">
                {truncateNote(
                  booking.notes
                )}
              </span>
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">

          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            <Eye className="h-4 w-4" />
            Details
          </button>

          {booking.status ===
            "pending" && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onAccept}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Accept
              </button>

              <button
                onClick={onReject}
                className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
              >
                Reject
              </button>
            </div>
          )}

          {booking.status ===
            "confirmed" && (
            <button
              onClick={onComplete}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-xl rounded-[22px] border border-slate-200 bg-white p-6 shadow-xl">

        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Booking Details
          </h3>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">

          <DetailItem
            label="Status"
            value={booking.status}
          />

          <DetailItem
            label="Date"
            value={new Date(
              booking.date
            ).toLocaleDateString()}
          />

          <DetailItem
            label="Time"
            value={booking.time || "-"}
          />

          <DetailItem
            label="Price"
            value={`$${booking.price}`}
          />

          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Notes
            </p>

            <div className="rounded-xl bg-slate-50 p-4 text-slate-700">
              {booking.notes || "No notes"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}