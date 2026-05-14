"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  ShieldCheck,
  Clock3,
  RefreshCw,
  FileText,
  BadgeCheck,
  UserRound,
} from "lucide-react";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    verifiedProviders: 0,
    pendingProviders: 0,
    admins: 0,
    regularUsers: 0,
  });

  const [recentReports, setRecentReports] =
    useState<any[]>([]);

  async function loadReports() {
    try {
      setLoading(true);

      // USERS
      const usersRes = await fetch(
        "/api/users?page=1&limit=1000",
        {
          cache: "no-store",
        }
      );

      const usersData = await usersRes.json();

      const users =
        usersData?.data?.users || [];

      // PROVIDERS
      const providersRes = await fetch(
        "/api/providers?page=1&limit=1000",
        {
          cache: "no-store",
        }
      );

      const providersData =
        await providersRes.json();

      const rawProviders =
        providersData?.data?.providers || [];

      // REMOVE DUPLICATES
      const providers = Array.from(
        new Map(
          rawProviders.map((p: any) => [
            p.id,
            p,
          ])
        ).values()
      );

      const verifiedProviders =
        providers.filter(
          (p: any) => p.isVerified
        ).length;

      const pendingProviders =
        providers.filter(
          (p: any) =>
            p.providerStatus === "pending"
        ).length;

      const admins = users.filter(
        (u: any) => u.role === "admin"
      ).length;

      const regularUsers = users.filter(
        (u: any) => u.role === "user"
      ).length;

      setStats({
        totalUsers: users.length,
        totalProviders: providers.length,
        verifiedProviders,
        pendingProviders,
        admins,
        regularUsers,
      });

      setRecentReports([
        {
          title: "Providers Report",
          value: `${providers.length} Providers`,
          status: "Updated",
        },
        {
          title: "Users Report",
          value: `${users.length} Users`,
          status: "Updated",
        },
        {
          title: "Pending Approvals",
          value: `${pendingProviders} Pending`,
          status:
            pendingProviders > 0
              ? "Needs Review"
              : "Completed",
        },
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const cards = [
    {
      title: "Total Providers",
      value: stats.totalProviders,
      icon: UserCheck,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Verified Providers",
      value: stats.verifiedProviders,
      icon: ShieldCheck,
      bg: "bg-emerald-100",
      color: "text-emerald-600",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingProviders,
      icon: Clock3,
      bg: "bg-amber-100",
      color: "text-amber-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      bg: "bg-violet-100",
      color: "text-violet-600",
    },
    {
      title: "Admins",
      value: stats.admins,
      icon: BadgeCheck,
      bg: "bg-indigo-100",
      color: "text-indigo-600",
    },
    {
      title: "Regular Users",
      value: stats.regularUsers,
      icon: UserRound,
      bg: "bg-rose-100",
      color: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Reports Center
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Platform Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Real-time overview of users,
            providers, approvals, and
            account activity.
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadReports}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <FileText className="h-4 w-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 p-8 shadow-lg">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
              <FileText className="h-3.5 w-3.5" />
              Live Reports
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-white">
              Real Platform Statistics
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
              View actual database reports
              for users, providers,
              approvals, and account
              activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:w-[320px]">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Providers
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {loading
                  ? "—"
                  : stats.totalProviders}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Users
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {loading
                  ? "—"
                  : stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <h3
                    className={`mt-2 text-3xl font-bold ${card.color}`}
                  >
                    {loading
                      ? "—"
                      : card.value}
                  </h3>
                </div>

                <div
                  className={`rounded-xl p-3 ${card.bg}`}
                >
                  <Icon
                    className={`h-5 w-5 ${card.color}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Reports Overview
              </h2>

              <p className="text-sm text-slate-500">
                Current platform statistics
                and account summaries.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Verified Providers
              </p>

              <h3 className="mt-2 text-4xl font-bold text-emerald-600">
                {loading
                  ? "—"
                  : stats.verifiedProviders}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Pending Reviews
              </p>

              <h3 className="mt-2 text-4xl font-bold text-amber-600">
                {loading
                  ? "—"
                  : stats.pendingProviders}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Admin Accounts
              </p>

              <h3 className="mt-2 text-4xl font-bold text-indigo-600">
                {loading
                  ? "—"
                  : stats.admins}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Regular Users
              </p>

              <h3 className="mt-2 text-4xl font-bold text-rose-600">
                {loading
                  ? "—"
                  : stats.regularUsers}
              </h3>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <Clock3 className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Reports
              </h2>

              <p className="text-sm text-slate-500">
                Latest generated reports.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {recentReports.map((report) => (
              <div
                key={report.title}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {report.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-500">
                      {report.value}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      report.status ===
                      "Updated"
                        ? "bg-emerald-100 text-emerald-700"
                        : report.status ===
                            "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}