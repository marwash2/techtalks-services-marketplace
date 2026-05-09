"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";

export default function DashboardPage() {
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    async function loadPending() {
      try {
        const res = await fetch("/api/providers?page=1&limit=1000", {
          cache: "no-store",
        });
        const data = await res.json();
        const providers = data?.data?.providers || [];

        setPendingApprovals(
          providers.filter((p: any) => p.providerStatus === "pending").length
        );
      } catch {
        setPendingApprovals(0);
      }
    }

    loadPending();
    const timer = setInterval(loadPending, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of approvals and admin activity.
          </p>
        </div>


      </div>

      {/* Pending Approvals Card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending Approvals</p>
              <p className="text-2xl font-semibold text-slate-900">
                {pendingApprovals}
              </p>
            </div>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Pending provider applications awaiting admin review.
          </p>

          {pendingApprovals > 0 && (
            <Link
              href="/admin/providers/approvals"
              className="mt-3 inline-flex rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              Review Approvals
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}