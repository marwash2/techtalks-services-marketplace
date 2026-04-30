import Link from "next/link";
import { ArrowRight, Clock, Calendar, User, MessageSquare } from "lucide-react";

interface PendingRequest {
  _id: string;
  userName: string;
  serviceTitle: string;
  date: string;
  price: number;
  status: string;
}

interface PendingRequestsProps {
  requests: PendingRequest[];
}

export default function PendingRequests({ requests }: PendingRequestsProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            Pending Requests
          </h3>
          <p className="text-sm text-slate-600">
            New customer booking requests waiting for confirmation.
          </p>
        </div>
        <Link
          href="/provider/bookings"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-sm font-medium text-slate-900">
            No pending requests
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            All current bookings are in progress or completed. New booking
            requests will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-3xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {request.userName}
                    </p>
                    <p className="text-xs text-slate-600">
                      {request.serviceTitle}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-blue-500">
                  ${request.price}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(request.date).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(request.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="rounded-full bg-yellow-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-yellow-700">
                  {request.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
