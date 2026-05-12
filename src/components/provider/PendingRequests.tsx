"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const avatarColors = [
  "bg-sky-100 text-sky-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600",
];

export default function PendingRequests({ requests }: PendingRequestsProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = requests.filter((r) => !dismissed.has(r._id));

  async function handleAccept(id: string) {
    try {
      await fetch(`/api/bookings/${id}/accept`, { method: "PATCH" });
    } catch {
      // optimistic UI still dismisses
    } finally {
      setDismissed((prev) => new Set(prev).add(id));
    }
  }

  async function handleDecline(id: string) {
    try {
      await fetch(`/api/bookings/${id}/decline`, { method: "PATCH" });
    } catch {
      // optimistic UI still dismisses
    } finally {
      setDismissed((prev) => new Set(prev).add(id));
    }
  }

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          Pending requests
        </h2>
        {visible.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
            {visible.length} awaiting
          </span>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
          <p className="text-sm text-slate-400">All requests handled.</p>
        </div>
      ) : (
        <ul>
          {visible.map((req, i) => {
            const initials = getInitials(req.userName);
            const colorClass = avatarColors[i % avatarColors.length];

            return (
              <li
                key={req._id}
                className="flex items-center gap-4 px-6 py-4 border-b border-slate-50 last:border-b-0"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${colorClass}`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {req.serviceTitle}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {req.userName} · {formatDate(req.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-semibold text-slate-900 mr-1">
                    ${req.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req._id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Decline
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}