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
  _id: string;
  userId: any;
  serviceId: any;
  date: string;
  price: number;
  notes?: string;
  status: BookingStatus;
};

const tabs = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];
export default function ProviderBookingsPage() {
  const { data: session } = useSession();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

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
      
      setBookings(prev =>
        prev.map(b =>
          b._id === bookingId
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
                key={booking._id}
                booking={booking}
                onAccept={() =>
                  updateStatus(
                    booking._id,
                    "confirmed"
                  )
                }
                onReject={() =>
                  updateStatus(
                    booking._id,
                    "cancelled"
                  )
                }
              />
            ))}

          </div>
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
 onAccept,
 onReject,
}: {
 booking: Booking;
 onAccept: ()=>void;
 onReject: ()=>void;
}) {
    return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="grid gap-6 lg:grid-cols-5 lg:items-center">

        {/* client */}
        <div>
          <p className="font-semibold text-slate-900">
            Client Booking
          </p>
          <p className="mt-1 text-sm text-slate-500">
            User ID: {String(booking.userId)}
          </p>
        </div>

         {/* service */}
        <div>
          <p className="font-semibold">
            Service #{String(booking.serviceId).slice(-6)}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Notes:
            {booking.notes || " No notes"}
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
        <div className="flex flex-wrap gap-3">

          <button className="rounded-xl border px-4 py-2 text-sm font-medium">
            <span className="inline-flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Details
            </span>
          </button>

          {booking.status === "pending" && (
            <>
              <button
                onClick={onAccept}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
              >
                Accept
              </button>

              <button
                onClick={onReject}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-600"
              >
                Reject
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}





