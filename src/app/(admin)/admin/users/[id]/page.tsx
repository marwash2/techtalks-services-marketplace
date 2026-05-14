"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Shield,
  UserRound,
  BadgeCheck,
  Clock3,
} from "lucide-react";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(
          `/api/users/${params.id}`,
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        setUser(data?.data ?? null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="space-y-4">
          <div className="h-8 w-52 animate-pulse rounded-xl bg-slate-200" />

          <div className="h-72 animate-pulse rounded-3xl bg-white" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <UserRound className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">
            User Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The requested user could not be found.
          </p>

          <Link
            href="/admin/users"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      ?.map((n: string) => n[0])
      ?.join("")
      ?.slice(0, 2)
      ?.toUpperCase() || "U";

  const roleColor =
    user.role === "admin"
      ? "bg-violet-500/20 text-violet-100 border-violet-300/20"
      : user.role === "provider"
        ? "bg-emerald-500/20 text-emerald-100 border-emerald-300/20"
        : "bg-blue-500/20 text-blue-100 border-blue-300/20";

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </Link>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            User Details
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            User Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Detailed overview of user account
            information and activity.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* Elegant Blue Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-10">
          {/* Decorative Glow */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />

          {/* Content */}
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-3xl font-bold text-white shadow-2xl backdrop-blur-xl">
                {initials}
              </div>

              {/* User Info */}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-bold tracking-tight text-white">
                    {user.name || "Unknown User"}
                  </h2>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-xl ${roleColor}`}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {user.role || "user"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-blue-100">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-xl">
                    User ID: {user.id?.slice(0, 8)}
                  </div>

                  <div className="rounded-full border border-emerald-300/20 bg-emerald-400/20 px-3 py-1.5 text-xs font-medium text-emerald-50">
                    Active Account
                  </div>
                </div>
              </div>
            </div>

            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-3 sm:w-[320px]">
              <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  Role
                </p>

                <p className="mt-2 text-lg font-bold text-white capitalize">
                  {user.role || "user"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  Joined
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  {user.createdAt
                    ? new Date(
                        user.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Content */}
        <div className="px-6 pb-8 pt-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Role */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Shield className="h-5 w-5 text-violet-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Role
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-slate-900 capitalize">
                    {user.role || "user"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Joined */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Joined
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </h3>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Clock3 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <h3 className="mt-1 text-lg font-semibold text-emerald-600">
                    Active
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Personal Info */}
            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h3>

              <div className="mt-6 space-y-5">
                {/* Full Name */}
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <UserRound className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Full Name
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {user.name || "—"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Email Address
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {user.email || "—"}
                    </p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <BadgeCheck className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      User ID
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-900">
                      {user.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Account Summary
              </h3>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Account Role
                  </span>

                  <span className="text-sm font-semibold text-slate-900 capitalize">
                    {user.role || "user"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Account Status
                  </span>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Registered
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {user.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">
                    Email
                  </span>

                  <span className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}