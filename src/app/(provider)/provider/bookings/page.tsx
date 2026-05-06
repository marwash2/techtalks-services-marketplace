"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ProviderSidebar from "@/components/provider/ProviderSidebar";
import { CalendarDays,CheckCircle2,Clock3,Search,XCircle,Eye,} from "lucide-react";

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

function truncateNote(text?: string, wordLimit = 20, charLimit = 120) {
  if (!text) return "No notes";
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);

  if (words.length > wordLimit) {
    return `${words.slice(0, wordLimit).join(" ")}...`;
  }
  if (trimmed.length > charLimit) {
    return `${trimmed.slice(0, charLimit)}...`;
  }
  return trimmed;
}

export default function ProviderBookingsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

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
      if (!bookingId) return;
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actor: "provider" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error(data.message || "Failed to update booking status");
        return;
      }

      setBookings((prev) =>
        prev.map((b) => ((b.id || b._id) === bookingId ? { ...b, status } : b))
      );
    } catch (error) {
      console.error(error);
    }
  }
 const filteredBookings = useMemo(() => {
    let result = bookings;

    if (activeTab !== "all") {
      result = result.filter(
        booking =>
          activeTab === "completed"
            ? booking.status === "completed" ||
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
      b => b.status === "pending"
    ).length,
    confirmed: bookings.filter(
      b => b.status === "confirmed"
    ).length,
    completed: bookings.filter(
      b =>
        b.status === "completed" ||
        b.status === "done"
    ).length,
    cancelled: bookings.filter(
      b => b.status === "cancelled"
    ).length,
  };
   return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="mx-auto flex max-w-7xl gap-6">

        <ProviderSidebar />

        <main className="flex-1 rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Bookings
              </h1>
              <p className="text-slate-500">
                Manage and respond to booking requests
              </p>
            </div>
          </div>

          {/* stat cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-8">

            <StatCard
              title="Total Bookings"
              value={stats.total}
              icon={<CalendarDays className="h-5 w-5" />}
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              icon={<Clock3 className="h-5 w-5" />}
            />

            <StatCard
              title="Accepted"
              value={stats.confirmed}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />

            <StatCard
              title="Cancelled"
              value={stats.cancelled}
              icon={<XCircle className="h-5 w-5" />}
            />
          </div>

          {/* tabs and search*/}
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
              <button
                key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={
                    activeTab === tab
                      ? "rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white"
                      : "rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-600"
                  }
                >
                  {tab === "all"
                    ? "All Bookings"
                    : tab}
                </button>
              ))}
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search bookings..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none"
              />
            </div>
          </div>

            {/* table header */}
          <div className="hidden rounded-2xl bg-slate-100 px-6 py-4 lg:grid lg:grid-cols-5 text-sm font-semibold text-slate-600">
            <div>Client</div>
            <div>Service</div>
            <div>Date</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

           {/* bookings */}
          <div className="mt-4 space-y-4">

            {loading && (
              <div className="rounded-2xl bg-white p-8 text-center text-slate-400">
                Loading bookings...
              </div>
            )}

            {!loading && filteredBookings.length===0 && (
              <div className="rounded-2xl border bg-white p-8 text-center text-slate-400">
                No bookings found
              </div>
            )}
            {filteredBookings.map((booking) => (
              <BookingRow
                key={booking.id || booking._id}
                booking={booking}
                onViewDetails={() => setSelectedBooking(booking)}
                onAccept={() =>
                  updateStatus(
                    booking.id || booking._id,
                    "confirmed"
                  )
                }
                onReject={() =>
                  updateStatus(
                    booking.id || booking._id,
                    "cancelled"
                  )
                }
                onComplete={() =>
                  updateStatus(
                    booking.id || booking._id,
                    "completed"
                  )
                }
              />
            ))}

          </div>

          {selectedBooking && (
            <BookingDetailsModal
              booking={selectedBooking}
              onClose={() => setSelectedBooking(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
function StatCard({
  title,
  value,
  icon,
}: {
  title:string;
  value:number;
  icon:React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <h3 className="text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {title}
      </p>
    </div>
  );
}
function StatusBadge({status}:{status:BookingStatus}) {
  const styles={
    pending:
      "bg-amber-100 text-amber-700",
    confirmed:
      "bg-emerald-100 text-emerald-700",
    completed:
      "bg-violet-100 text-violet-700",
    done:
      "bg-violet-100 text-violet-700",
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
function BookingRow({
 booking,
 onViewDetails,
 onAccept,
 onReject,
 onComplete,
}: {
 booking: Booking;
 onViewDetails: ()=>void;
 onAccept: ()=>void;
 onReject: ()=>void;
 onComplete: ()=>void;
}) {
  const userName =
    booking.userId && typeof booking.userId === "object"
      ? booking.userId.name || booking.userId.email || booking.userId._id
      : booking.userId;
  const serviceTitle =
    booking.service?.title ||
    (booking.serviceId && typeof booking.serviceId === "object"
      ? booking.serviceId.title || booking.serviceId._id
      : booking.serviceId);

    return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="grid gap-6 lg:grid-cols-5 lg:items-center">

        {/* client */}
        <div>
          <p className="font-semibold text-slate-900">
            Client Booking
          </p>
          <p className="mt-1 text-sm text-slate-500">
            User: {String(userName ?? "-")}
          </p>
        </div>

         {/* service */}
        <div>
          <p className="font-semibold">
            {serviceTitle ? String(serviceTitle) : "Service"}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Notes:
            <span className="ml-1 inline-block max-w-full break-words align-top whitespace-pre-wrap">
              {truncateNote(booking.notes, 20, 120)}
            </span>
          </p>
        </div>

         {/* date */}
        <div>
          <p className="font-medium">
            {new Date(
              booking.date
            ).toLocaleDateString()}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            ${booking.price}
          </p>
        </div>

         {/* status */}
        <div>
          <StatusBadge
            status={booking.status}
          />
        </div>

         {/* actions */}
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <button onClick={onViewDetails} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer">
            <span className="inline-flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </span>
          </button>

          <div className="flex flex-wrap gap-2">

            {booking.status === "pending" && (
              <>
                <button
                  onClick={onAccept}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                >
                  Accept
                </button>

                <button
                  onClick={onReject}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  Reject
                </button>
              </>
            )}

            {booking.status === "confirmed" && (
              <button
                onClick={onComplete}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                Complete
              </button>
            )}
          </div>
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
  const userName =
    booking.userId && typeof booking.userId === "object"
      ? booking.userId.name || booking.userId.email || booking.userId._id
      : booking.userId;
  const userEmail =
    booking.userId && typeof booking.userId === "object"
      ? booking.userId.email
      : "";
  const serviceTitle =
    booking.service?.title ||
    (booking.serviceId && typeof booking.serviceId === "object"
      ? booking.serviceId.title || booking.serviceId._id
      : booking.serviceId);
  const servicePrice =
    booking.service?.price ??
    (booking.serviceId && typeof booking.serviceId === "object" ? booking.serviceId.price : booking.price);
  const serviceDuration =
    booking.service?.duration ??
    (booking.serviceId && typeof booking.serviceId === "object" ? booking.serviceId.duration : "");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Booking Details</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-100 bg-red-500 hover:bg-red-700 cursor-pointer">
            X
          </button>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2">
          <p><span className="font-semibold">Client:</span> {String(userName ?? "-")}</p>
          <p><span className="font-semibold">Client Email:</span> {String(userEmail || "-")}</p>
          <p><span className="font-semibold">Service:</span> {String(serviceTitle ?? "-")}</p>
          <p><span className="font-semibold">Status:</span> {booking.status}</p>
          <p><span className="font-semibold">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
          <p><span className="font-semibold">Time:</span> {String(booking.time || "-")}</p>
          <p><span className="font-semibold">Price:</span> ${String(servicePrice ?? "-")}</p>
          <p><span className="font-semibold">Duration:</span> {String(serviceDuration || "-")} min</p>
          <p className="md:col-span-2">
            <span className="font-semibold">Notes:</span>
            <span className="mt-1 block max-h-28 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2">
              {booking.notes || "-"}
            </span>
          </p>
          <p><span className="font-semibold">Created:</span> {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : "-"}</p>
          <p><span className="font-semibold">Updated:</span> {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : "-"}</p>
        </div>
      </div>
    </div>
  );
}





