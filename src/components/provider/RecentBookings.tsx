import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Booking {
  _id: string;
  userId?: { name?: string } | string;
  serviceTitle: string;
  date: string;
  price: number;
  status: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

const statusConfig: Record<
  string,
  { label: string; classes: string }
> = {
  completed: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-sky-50 text-sky-700",
  },
  "in-progress": {
    label: "In progress",
    classes: "bg-blue-50 text-blue-700",
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-rose-50 text-rose-600",
  },
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getUserName(userId?: { name?: string } | string): string {
  if (!userId) return "Customer";
  if (typeof userId === "object" && userId.name) return userId.name;
  return "Customer";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const avatarColors = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-600",
];

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Recent bookings</h2>
        <Link
          href="/provider/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-slate-400">No bookings yet.</p>
        </div>
      ) : (
        <ul>
          {bookings.map((booking, i) => {
            const name = getUserName(booking.userId);
            const initials = getInitials(name);
            const colorClass = avatarColors[i % avatarColors.length];
            const status =
              statusConfig[booking.status] ?? {
                label: booking.status,
                classes: "bg-slate-100 text-slate-500",
              };

            return (
              <li
                key={booking._id}
                className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/60 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorClass}`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {booking.serviceTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {name} · {formatDate(booking.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    ${booking.price.toFixed(2)}
                  </p>
                  <span
                    className={`mt-1 inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${status.classes}`}
                  >
                    {status.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}