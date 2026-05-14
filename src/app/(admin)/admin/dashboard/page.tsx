"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  Clock3,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  ArrowRight,
  Star,
  Bell,
  UserRound,
  Shield,
} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalProviders: 0,
    pendingProviders: 0,
    verifiedProviders: 0,
    unverifiedProviders: 0,

    totalUsers: 0,
    totalAdmins: 0,
    regularUsers: 0,
  });

  async function loadDashboard() {
    try {
      setLoading(true);

      // Providers
      const providersRes = await fetch(
        "/api/providers?page=1&limit=500",
        {
          cache: "no-store",
        }
      );

      const providersData = await providersRes.json();

      const providers =
        providersData?.data?.providers || [];

      const pending = providers.filter(
        (p: any) => p.providerStatus === "pending"
      ).length;

      const verified = providers.filter(
        (p: any) => p.isVerified
      ).length;

      const unverified = providers.filter(
        (p: any) => !p.isVerified
      ).length;

      // Users
      const usersRes = await fetch(
        "/api/users?page=1&limit=1000",
        {
          cache: "no-store",
        }
      );

      const usersData = await usersRes.json();

      const users = usersData?.data?.users || [];

      const admins = users.filter(
        (u: any) => u.role === "admin"
      ).length;

      const regularUsers = users.filter(
        (u: any) => u.role === "user"
      ).length;

      setStats({
        totalProviders: providers.length,
        pendingProviders: pending,
        verifiedProviders: verified,
        unverifiedProviders: unverified,

        totalUsers: users.length,
        totalAdmins: admins,
        regularUsers,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(
      loadDashboard,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Providers",
      value: stats.totalProviders,
      icon: (
        <Users className="w-5 h-5 text-slate-600" />
      ),
      bg: "bg-slate-100",
      text: "text-slate-900",
    },

    {
      title: "Pending Approvals",
      value: stats.pendingProviders,
      icon: (
        <Clock3 className="w-5 h-5 text-amber-600" />
      ),
      bg: "bg-amber-100",
      text: "text-amber-600",
    },

    {
      title: "Verified Providers",
      value: stats.verifiedProviders,
      icon: (
        <ShieldCheck className="w-5 h-5 text-emerald-600" />
      ),
      bg: "bg-emerald-100",
      text: "text-emerald-600",
    },

    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: (
        <UserRound className="w-5 h-5 text-blue-600" />
      ),
      bg: "bg-blue-100",
      text: "text-blue-600",
    },

    {
      title: "Admins",
      value: stats.totalAdmins,
      icon: (
        <Shield className="w-5 h-5 text-violet-600" />
      ),
      bg: "bg-violet-100",
      text: "text-violet-600",
    },

    {
      title: "Regular Users",
      value: stats.regularUsers,
      icon: (
        <UserCheck className="w-5 h-5 text-rose-600" />
      ),
      bg: "bg-rose-100",
      text: "text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage providers, users, approvals,
            and platform activity.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold ${card.text}`}
                >
                  {loading ? "—" : card.value}
                </h2>
              </div>

              <div
                className={`rounded-xl p-3 ${card.bg}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Quick Actions */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly manage your platform.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Providers */}
            <Link
              href="/admin/providers"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Manage Providers
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all providers.
              </p>
            </Link>

            {/* Approvals */}
            <Link
              href="/admin/providers/approvals"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-amber-200 hover:bg-amber-50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Clock3 className="w-5 h-5 text-amber-600" />
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Review Approvals
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Review pending provider
                applications.
              </p>

              {stats.pendingProviders > 0 && (
                <div className="mt-3 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {stats.pendingProviders} Pending
                </div>
              )}
            </Link>

            {/* Users */}
            <Link
              href="/admin/users"
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-violet-200 hover:bg-violet-50"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <UserRound className="w-5 h-5 text-violet-600" />
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 transition group-hover:translate-x-1" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Manage Users
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View and manage all registered
                users.
              </p>

              <div className="mt-3 inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                {stats.totalUsers} Users
              </div>
            </Link>

            {/* Analytics */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Star className="w-5 h-5 text-emerald-600" />
                </div>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Platform Analytics
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Monitor growth and platform
                statistics.
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Providers
                  </span>

                  <span className="font-semibold text-slate-900">
                    {stats.totalProviders}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Users
                  </span>

                  <span className="font-semibold text-slate-900">
                    {stats.totalUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Platform Activity
              </h2>

              <p className="text-sm text-slate-500">
                Current overview
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Verified Providers
                </span>
              </div>

              <span className="text-sm font-bold text-slate-900">
                {stats.verifiedProviders}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2">
                  <Clock3 className="w-4 h-4 text-amber-600" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Pending Reviews
                </span>
              </div>

              <span className="text-sm font-bold text-slate-900">
                {stats.pendingProviders}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <UserRound className="w-4 h-4 text-blue-600" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Total Users
                </span>
              </div>

              <span className="text-sm font-bold text-slate-900">
                {stats.totalUsers}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2">
                  <Shield className="w-4 h-4 text-violet-600" />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Admin Accounts
                </span>
              </div>

              <span className="text-sm font-bold text-slate-900">
                {stats.totalAdmins}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}