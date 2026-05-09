"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`, {
          cache: "no-store",
        });
        const data = await res.json();
        setUser(data?.data ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.id]);

  if (loading)
    return <div className="p-6 text-sm text-slate-500">Loading user...</div>;
  if (!user)
    return <div className="p-6 text-sm text-red-500">User not found.</div>;

return (
  <div className="space-y-6 p-2 sm:p-4">

    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      <div>
        {/* Back */}
        <Link
          href="/admin/users"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Users
        </Link>

        <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Detailed overview of user account and activity
        </p>
      </div>

      {/* Actions */}
      <Link
        href={`/admin/users/${user.id}/edit`}
        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        Edit User
      </Link>
    </div>

    {/* Profile Card */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
          {user.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* Info */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {user.name || "Unknown User"}
          </h2>

          <p className="text-sm text-slate-500">{user.email}</p>

          {/* Role Badge */}
          <span className="mt-1 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {user.role || "user"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-5 border-t" />

      {/* Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Full Name</p>
          <p className="mt-1 font-medium text-slate-900">
            {user.name || "-"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Email Address</p>
          <p className="mt-1 font-medium text-slate-900">
            {user.email || "-"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Role</p>
          <p className="mt-1 font-medium text-slate-900">
            {user.role || "-"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Joined Date</p>
          <p className="mt-1 font-medium text-slate-900">
            {user.createdAt
              ? new Date(user.createdAt).toLocaleString()
              : "-"}
          </p>
        </div>
      </div>
    </div>
  </div>
);
}
