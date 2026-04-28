import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Booking {
  _id: string;
  userId?: { name?: string } | string;
  createdAt: Date | string;
  price: number;
  status: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-950">
          Recent Bookings
        </h2>
        <Link
          href="/provider/bookings"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            No bookings yet
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Your recent bookings will appear here once customers start booking
            your services.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <span className="text-sm font-medium text-slate-600">
                  {typeof booking.userId === "object" && booking.userId?.name
                    ? booking.userId.name.charAt(0).toUpperCase()
                    : "C"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {typeof booking.userId === "object" && booking.userId?.name
                    ? booking.userId.name
                    : "Customer"}
                </p>
                <p className="text-xs text-slate-600">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">
                  ${booking.price}
                </p>
                <div className="flex items-center gap-1">
                  {getStatusIcon(booking.status)}
                  <span className="text-xs capitalize text-slate-600">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
