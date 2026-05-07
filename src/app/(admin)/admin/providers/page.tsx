
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProviderUser = { id: string; name: string; email: string };

interface Provider {
  id: string;
  userId: ProviderUser | string;
  businessName: string;
  description?: string;
  location: string;
  rating?: number;
  isVerified?: boolean;
  providerStatus?: "pending" | "approved" | "rejected"; // add this
  totalReviews?: number;
  avatar?: string | null;
  createdAt?: string;
}

const STATUS_OPTIONS = ["all", "verified", "unverified"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

function getUser(p: Provider): ProviderUser | null {
  if (p.userId && typeof p.userId === "object") return p.userId as ProviderUser;
  return null;
}

function Avatar({ provider }: { provider: Provider }) {
  const initials = provider.businessName?.slice(0, 2).toUpperCase() ?? "??";
  if (provider.avatar) {
    return (
      <img
        src={provider.avatar}
        alt={provider.businessName}
        className="w-10 h-10 rounded-xl object-cover"
      />
    );
  }
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
  ];
  const color = colors[provider.businessName?.charCodeAt(0) % colors.length] ?? colors[0];
  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${color}`}>
      {initials}
    </div>
  );
}

function StarRating({ rating }: { rating?: number }) {
  const r = rating ?? 0;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(r) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{r > 0 ? r.toFixed(1) : "—"}</span>
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-fade-in">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition cursor-pointer ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // confirm modal state
  const [modal, setModal] = useState<{
    open: boolean;
    type: "delete" | "verify" | "unverify" | null;
    provider: Provider | null;
  }>({ open: false, type: null, provider: null });

  const LIMIT = 10;

  useEffect(() => {
    fetchProviders();
  }, [page]);

  async function fetchProviders() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/providers?page=${page}&limit=${LIMIT}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch providers");

      const all: Provider[] = data.data?.providers ?? data.data ?? [];
      console.log("ALL PROVIDERS:", all.map(p => ({
        name: p.businessName,
        status: (p as any).providerStatus,
        verified: p.isVerified
      })));
      // filter only approved providers
      const approved = all.filter((p) => p.providerStatus === "approved");
      setProviders(approved);

      setTotalPages(data.data?.pagination?.pages ?? 1);
      setTotal(data.data?.pagination?.total ?? approved.length);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(provider: Provider) {
    setActionLoading(provider.id);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete provider");
      setProviders((prev) => prev.filter((p) => p.id !== provider.id));
      setTotal((t) => t - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete provider");
    } finally {
      setActionLoading(null);
      setModal({ open: false, type: null, provider: null });
    }
  }

  async function handleVerify(provider: Provider, verified: boolean) {
    setActionLoading(provider.id);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: verified, providerStatus: verified ? "approved" : "approved" }),
      });
      if (!res.ok) throw new Error("Failed to update provider");
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, isVerified: verified } : p))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update provider");
    } finally {
      setActionLoading(null);
      setModal({ open: false, type: null, provider: null });
    }
  }

  const filtered = providers.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      (typeof p.userId === "object" &&
        ((p.userId as ProviderUser).name?.toLowerCase().includes(search.toLowerCase()) ||
          (p.userId as ProviderUser).email?.toLowerCase().includes(search.toLowerCase())));
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && p.isVerified) ||
      (statusFilter === "unverified" && !p.isVerified);
    return matchesSearch && matchesStatus;
  });

  const verifiedCount = providers.filter((p) => p.isVerified).length;
  const unverifiedCount = providers.filter((p) => !p.isVerified).length;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.18s ease both; }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 400px 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

      <ConfirmModal
        open={modal.open}
        title={
          modal.type === "delete"
            ? "Delete Provider"
            : modal.type === "verify"
              ? "Verify Provider"
              : "Remove Verification"
        }
        description={
          modal.type === "delete"
            ? `Are you sure you want to delete "${modal.provider?.businessName}"? This action cannot be undone.`
            : modal.type === "verify"
              ? `Verify "${modal.provider?.businessName}"? They will appear as a verified provider.`
              : `Remove verification from "${modal.provider?.businessName}"?`
        }
        confirmLabel={
          modal.type === "delete" ? "Delete" : modal.type === "verify" ? "Verify" : "Remove"
        }
        confirmClass={
          modal.type === "delete"
            ? "bg-red-500 hover:bg-red-600"
            : modal.type === "verify"
              ? "bg-emerald-500 hover:bg-emerald-600"
              : "bg-amber-500 hover:bg-amber-600"
        }
        onConfirm={() => {
          if (!modal.provider) return;
          if (modal.type === "delete") handleDelete(modal.provider);
          else if (modal.type === "verify") handleVerify(modal.provider, true);
          else if (modal.type === "unverify") handleVerify(modal.provider, false);
        }}
        onCancel={() => setModal({ open: false, type: null, provider: null })}
      />

      <div className="p-6 space-y-6 min-h-screen bg-gray-50">



        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Providers
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage and verify all service providers on the platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending Approvals Button */}
            <Link
              href="/admin/providers/approvals"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition cursor-pointer shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pending Approvals
            </Link>

            {/* Refresh Button */}
            <button
              onClick={fetchProviders}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer shadow-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Providers", value: total, color: "text-gray-900", icon: (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            },
            {
              label: "Verified", value: verifiedCount, color: "text-emerald-600", icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              )
            },
            {
              label: "Pending Verification", value: unverifiedCount, color: "text-amber-600", icon: (
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-xl">{stat.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>


        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, location, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
            />
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium border transition cursor-pointer capitalize ${statusFilter === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-xl shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 rounded shimmer" />
                    <div className="h-3 w-24 rounded shimmer" />
                  </div>
                  <div className="h-6 w-20 rounded-full shimmer" />
                  <div className="h-8 w-24 rounded-xl shimmer" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={fetchProviders} className="mt-3 text-blue-600 text-sm underline cursor-pointer">
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-14 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No providers found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((provider) => {
                    const user = getUser(provider);
                    const isLoading = actionLoading === provider.id;
                    return (
                      <tr key={provider.id} className="hover:bg-gray-50/50 transition-colors animate-fade-in">
                        {/* Provider */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar provider={provider} />
                            <div>
                              <p className="font-semibold text-gray-900">{provider.businessName}</p>
                              {user && (
                                <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="text-sm">{provider.location || "—"}</span>
                          </div>
                        </td>

                        {/* Rating */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <StarRating rating={provider.rating} />
                            <p className="text-xs text-gray-400">{provider.totalReviews ?? 0} reviews</p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {provider.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Unverified
                            </span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {provider.createdAt
                            ? new Date(provider.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {isLoading ? (
                              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                {provider.isVerified ? (
                                  <button
                                    onClick={() => setModal({ open: true, type: "unverify", provider })}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    Unverify
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setModal({ open: true, type: "verify", provider })}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                    Verify
                                  </button>
                                )}
                                <button
                                  onClick={() => setModal({ open: true, type: "delete", provider })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}