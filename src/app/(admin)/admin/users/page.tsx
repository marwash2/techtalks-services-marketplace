"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Search,
  Trash2,
  UserRound,
  Users,
  Shield,
  RefreshCw,
  UserCheck,
} from "lucide-react";

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
}

function ConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 className="h-7 w-7 text-red-600" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
          Delete User
        </h2>

        <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
          Are you sure you want to permanently delete this user?
          This action cannot be undone.
        </p>

        <div className="mt-7 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [deleteId, setDeleteId] = useState<string | null>(
    null
  );

  async function fetchUsers() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/users?page=1&limit=1000"
      );

      const data = await res.json();

      const list = data?.data?.users || [];

      setUsers(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser(id: string) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete user");
        return;
      }

      setUsers((prev) =>
        prev.filter((u) => u.id !== id)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = search.toLowerCase();

      const matchesSearch =
        !query ||
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" ||
        u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const roleOptions = [
    "all",
    ...new Set(
      users.map((u) => u.role).filter(Boolean)
    ),
  ];

  const totalUsers = users.length;

  const adminsCount = users.filter(
    (u) => u.role === "admin"
  ).length;

  const providersCount = users.filter(
    (u) => u.role === "provider"
  ).length;

  const regularUsersCount = users.filter(
    (u) => u.role === "user"
  ).length;

  return (
    <>
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteUser(deleteId);
        }}
      />

      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Manage Users
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage all registered users.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {loading ? "—" : totalUsers}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Admins */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Admins
                </p>

                <h2 className="mt-2 text-3xl font-bold text-violet-600">
                  {loading ? "—" : adminsCount}
                </h2>
              </div>

              <div className="rounded-xl bg-violet-100 p-3">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </div>

          {/* Providers */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Providers
                </p>

                <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                  {loading ? "—" : providersCount}
                </h2>
              </div>

              <div className="rounded-xl bg-emerald-100 p-3">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Regular Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Regular Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-rose-600">
                  {loading
                    ? "—"
                    : regularUsersCount}
                </h2>
              </div>

              <div className="rounded-xl bg-rose-100 p-3">
                <UserRound className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  placeholder="Search users by name or email..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 lg:w-52"
              >
                {roleOptions.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role === "all"
                      ? "All Roles"
                      : role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 6 }).map(
                  (_, i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  )
                )}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-16 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-200" />

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  No users found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your search or
                  filters.
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name || "—"}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID: {user.id?.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-600">
                        {user.email || "—"}
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-violet-100 text-violet-700"
                              : user.role === "provider"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-slate-500">
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
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            onClick={() =>
                              setDeleteId(user.id)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          {!loading && (
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
              <p>
                Showing {filteredUsers.length} users
              </p>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                <Users size={14} />
                Total: {totalUsers}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}