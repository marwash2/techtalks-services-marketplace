"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEditUserPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
const [preview, setPreview] = useState<string | null>(null);
const [message, setMessage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`, { cache: "no-store" });
        const data = await res.json();
        const user = data?.data;
        setForm({
          name: user?.name || "",
          email: user?.email || "",
          role: user?.role || "user",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [params.id]);


function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;

  setAvatar(file);
  setPreview(URL.createObjectURL(file));
}


async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError(null);
  setMessage(null);

  try {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("role", form.role);

    if (avatar) {
      formData.append("avatar", avatar);
    }

    const res = await fetch(`/api/users/${params.id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.message || "Failed to update user");
      return;
    }

    setMessage("User updated successfully ✅");

    router.push(`/admin/users/${params.id}`);
  } catch (err) {
    setError("Something went wrong");
  } finally {
    setSaving(false);
  }
}

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading user...</div>;

  return (
  <div className="space-y-6 p-2 sm:p-4">
    
    {/* HEADER */}
    <div>
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

      <h1 className="text-3xl font-bold text-slate-900">
        Edit User
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Update user account information and profile picture
      </p>
    </div>

    {/* FORM */}
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {error}
  </div>
)}

{message && (
  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
    {message}
  </div>
)}
      {/* AVATAR UPLOAD CARD */}
      <div>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">
          Profile Picture
        </h2>

        <div className="flex items-center gap-4">

          {/* Avatar Preview */}
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-100">
            {preview ? (
              <img
                src={preview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-slate-600">
                {form.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>

          {/* Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="text-sm text-slate-600"
            />

            <p className="mt-1 text-xs text-slate-400">
              JPG, PNG or WEBP (recommended square image)
            </p>
          </div>
        </div>
      </div>

      {/* NAME */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <input
          value={form.name}
          onChange={(e) =>
            setForm((p) => ({ ...p, name: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>

      {/* EMAIL */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((p) => ({ ...p, email: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          required
        />
      </div>

      {/* ROLE */}
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Role
        </label>
        <select
          value={form.role}
          onChange={(e) =>
            setForm((p) => ({ ...p, role: e.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="user">User</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">

        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </div>
    </form>
  </div>
);
}

