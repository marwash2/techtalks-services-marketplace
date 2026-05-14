"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Activity,
  MapPin,
  BadgeCheck,
  Clock3,
} from "lucide-react";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  async function loadAnalytics() {
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

      const usersList =
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
      const providersList = Array.from(
        new Map(
          rawProviders.map((p: any) => [
            p.id,
            p,
          ])
        ).values()
      );

      setUsers(usersList);
      setProviders(providersList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = useMemo(() => {
    const verifiedProviders = providers.filter(
      (p: any) => p.isVerified
    ).length;

    const pendingProviders = providers.filter(
      (p: any) =>
        p.providerStatus === "pending"
    ).length;

    const admins = users.filter(
      (u: any) => u.role === "admin"
    ).length;

    const regularUsers = users.filter(
      (u: any) => u.role === "user"
    ).length;

    // LOCATIONS
    const locationsMap: Record<
      string,
      number
    > = {};

    providers.forEach((provider: any) => {
      const location =
        provider.location || "Unknown";

      locationsMap[location] =
        (locationsMap[location] || 0) + 1;
    });

    const topLocations = Object.entries(
      locationsMap
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalUsers: users.length,
      totalProviders: providers.length,
      verifiedProviders,
      pendingProviders,
      admins,
      regularUsers,
      topLocations,
    };
  }, [users, providers]);

  const verificationRate =
    stats.totalProviders > 0
      ? Math.round(
          (stats.verifiedProviders /
            stats.totalProviders) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Analytics Center
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Platform Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Real-time insights and
            platform activity from your
            database.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Analytics
        </button>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 p-8 shadow-lg">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
              <BarChart3 className="h-3.5 w-3.5" />
              Live Analytics
            </div>

            <h2 className="mt-5 text-4xl font-bold tracking-tight text-white">
              Real Platform Insights
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
              Monitor users, providers,
              verification activity, and
              real platform growth.
            </p>
          </div>

          {/* MINI STATS */}
          <div className="grid grid-cols-2 gap-4 lg:w-[340px]">
            <div className="rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Providers
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {loading
                  ? "—"
                  : stats.totalProviders}
              </p>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-wide text-blue-100">
                Verification
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {loading
                  ? "—"
                  : `${verificationRate}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Users
              </p>

              <h3 className="mt-2 text-3xl font-bold text-blue-600">
                {loading
                  ? "—"
                  : stats.totalUsers}
              </h3>
            </div>

            <div className="rounded-xl bg-blue-100 p-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Providers
              </p>

              <h3 className="mt-2 text-3xl font-bold text-violet-600">
                {loading
                  ? "—"
                  : stats.totalProviders}
              </h3>
            </div>

            <div className="rounded-xl bg-violet-100 p-3">
              <UserCheck className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Verified Providers
              </p>

              <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                {loading
                  ? "—"
                  : stats.verifiedProviders}
              </h3>
            </div>

            <div className="rounded-xl bg-emerald-100 p-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Admin Accounts
              </p>

              <h3 className="mt-2 text-3xl font-bold text-amber-600">
                {loading
                  ? "—"
                  : stats.admins}
              </h3>
            </div>

            <div className="rounded-xl bg-amber-100 p-3">
              <BadgeCheck className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* PLATFORM GROWTH */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Platform Growth
              </h2>

              <p className="text-sm text-slate-500">
                Real-time platform growth
                overview.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {[
              {
                label: "Users",
                value: stats.totalUsers,
                color: "bg-blue-500",
              },
              {
                label: "Providers",
                value: stats.totalProviders,
                color: "bg-violet-500",
              },
              {
                label:
                  "Verified Providers",
                value:
                  stats.verifiedProviders,
                color: "bg-emerald-500",
              },
              {
                label: "Admins",
                value: stats.admins,
                color: "bg-amber-500",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {item.label}
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {item.value}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{
                      width: `${Math.min(
                        item.value * 8,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Verification Rate
              </p>

              <h3 className="mt-2 text-3xl font-bold text-emerald-600">
                {verificationRate}%
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Pending Reviews
              </p>

              <h3 className="mt-2 text-3xl font-bold text-amber-600">
                {stats.pendingProviders}
              </h3>
            </div>
          </div>
        </div>

        {/* TOP LOCATIONS */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <MapPin className="h-5 w-5 text-violet-600" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Top Provider Locations
              </h2>

              <p className="text-sm text-slate-500">
                Most active provider
                locations.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {stats.topLocations.length ===
            0 ? (
              <div className="rounded-2xl bg-slate-50 p-8 text-center">
                <Activity className="mx-auto h-10 w-10 text-slate-300" />

                <p className="mt-3 text-sm text-slate-500">
                  No locations available.
                </p>
              </div>
            ) : (
              stats.topLocations.map(
                ([location, count], index) => (
                  <div
                    key={location}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-700 shadow-sm">
                          #{index + 1}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {location}
                          </p>

                          <p className="text-xs text-slate-500">
                            Active Providers
                          </p>
                        </div>
                      </div>

                      <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        {count}
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}