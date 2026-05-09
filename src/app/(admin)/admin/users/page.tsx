"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Search, Trash2, UserRound, Users } from "lucide-react";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users?page=1&limit=100000");
      const data = await res.json();
      const list = data.data?.users || [];
      setUsers(list);
      setFilteredUsers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const normalizedSearch = search.toLowerCase().trim();
    const filtered = users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(normalizedSearch) ||
        u.email?.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [search, users, roleFilter]);

async function deleteUser(id: string) {
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete user");
      return;
    }

    await fetchUsers();
  } catch (error) {
    console.error(error);
  } finally {
    setDeleteId(null);
  }
}
  if (loading) return <div className="p-6 text-sm text-slate-500">Loading users...</div>;

  const totalUsers = users.length;
  const roleOptions = ["all", ...new Set(users.map((u) => u.role).filter(Boolean))];

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all registered users on the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 lg:w-52"
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role === "all" ? "All Roles" : role}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
         {deleteId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-2xl">

      {/* Icon */}
      <div className="mb-4 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          🗑️
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-bold text-gray-800">
        Delete User
      </h2>

      {/* Description */}
      <p className="mb-6 leading-relaxed text-gray-600">
        Are you sure you want to permanently delete this user?
        <br />
        This action cannot be undone.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">

        {/* Cancel */}
        <button
          onClick={() => setDeleteId(null)}
          className="cursor-pointer rounded-xl border border-gray-300 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
        >
          Keep User
        </button>

        {/* Confirm */}
        <button
          onClick={() => deleteUser(deleteId)}
          className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
        >
          Yes, Delete
        </button>

      </div>
    </div>
  </div>
)}
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Joined At</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-slate-100 text-sm text-slate-700">
                  <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <UserRound size={14} />
                      </div>
                      <span className="font-medium text-slate-900">{user.name || "-"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{user.email || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {user.role || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No users found.</p>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <p>Showing {filteredUsers.length} users</p>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <Users size={14} />
            Total: {totalUsers}
          </div>
        </div>
      </div>
    </div>
  );
}
