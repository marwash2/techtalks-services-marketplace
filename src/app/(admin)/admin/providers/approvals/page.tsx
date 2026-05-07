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
                className="w-12 h-12 rounded-2xl object-cover"
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
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${color}`}>
            {initials}
        </div>
    );
}

function ConfirmModal({
    open,
    type,
    providerName,
    onConfirm,
    onCancel,
    loading,
}: {
    open: boolean;
    type: "approve" | "reject" | null;
    providerName: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading: boolean;
}) {
    if (!open || !type) return null;
    const isApprove = type === "approve";
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" style={{ animation: "fadeUp 0.18s ease both" }}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isApprove ? "bg-emerald-50" : "bg-red-50"}`}>
                    {isApprove ? (
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    {isApprove ? "Approve Provider" : "Reject Application"}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    {isApprove
                        ? `Approve "${providerName}"? They will be verified and visible to customers.`
                        : `Reject "${providerName}"? Their provider application will be permanently removed.`}
                </p>
                <div className="mt-5 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-xl text-sm font-medium text-white transition cursor-pointer disabled:opacity-70 flex items-center gap-2 ${isApprove ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {loading && (
                            <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        )}
                        {isApprove ? "Approve" : "Reject"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PendingApprovalsPage() {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");

    const [modal, setModal] = useState<{
        open: boolean;
        type: "approve" | "reject" | null;
        provider: Provider | null;
    }>({ open: false, type: null, provider: null });

    const LIMIT = 10;

    useEffect(() => {
        fetchPending();
    }, [page]);

    async function fetchPending() {
        setLoading(true);
        setError(null);
        try {
            // Fetch all providers then filter unverified client-side
            // (your API doesn't have an isVerified filter param yet)
            const res = await fetch(`/api/providers?page=${page}&limit=100`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch providers");

            const all: Provider[] = data.data?.providers ?? data.data ?? [];
            const pending = all.filter((p) => p.providerStatus === "pending");
            setProviders(pending);
            setTotalPages(1); // client-side filtered, no server pagination needed here
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(provider: Provider) {
        setActionLoading(provider.id);
        try {
            const res = await fetch(`/api/providers/${provider.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isVerified: true, providerStatus: "approved" }),
            });
            const data = await res.json();
            console.log("APPROVE RESPONSE:", data); // add this
            if (!res.ok) throw new Error(data.message || "Failed to approve provider");
            setProviders((prev) => prev.filter((p) => p.id !== provider.id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to approve provider");
        } finally {
            setActionLoading(null);
            setModal({ open: false, type: null, provider: null });
        }
    }

    async function handleReject(provider: Provider) {
        setActionLoading(provider.id);
        try {
            // Option: soft reject instead of delete
            const res = await fetch(`/api/providers/${provider.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ providerStatus: "rejected" }),
            });
            if (!res.ok) throw new Error("Failed to reject provider");
            setProviders((prev) => prev.filter((p) => p.id !== provider.id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to reject provider");
        } finally {
            setActionLoading(null);
            setModal({ open: false, type: null, provider: null });
        }
    }

    const filtered = providers.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        const user = getUser(p);
        return (
            p.businessName.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            user?.name?.toLowerCase().includes(q) ||
            user?.email?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: fadeUp 0.2s ease both; }
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

            <ConfirmModal
                open={modal.open}
                type={modal.type}
                providerName={modal.provider?.businessName ?? ""}
                loading={actionLoading === modal.provider?.id}
                onConfirm={() => {
                    if (!modal.provider) return;
                    if (modal.type === "approve") handleApprove(modal.provider);
                    else handleReject(modal.provider);
                }}
                onCancel={() => setModal({ open: false, type: null, provider: null })}
            />

            <div className="p-6 space-y-6 min-h-screen bg-gray-50">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        {/* Back Button */}
                        <Link
                            href="/admin/providers"
                            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-2 transition cursor-pointer"
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
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to Providers
                        </Link>

                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Pending Approvals
                            </h1>

                            {!loading && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                    {filtered.length} pending
                                </span>
                            )}
                        </div>

                        <p className="text-sm text-gray-500 mt-0.5">
                            Review and approve provider applications before they go live
                        </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchPending}
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

                {/* Info banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-sm font-medium text-blue-800">How approvals work</p>
                        <p className="text-sm text-blue-700 mt-0.5">
                            Approving a provider marks them as verified and makes their services visible to customers.
                            Rejecting permanently removes their application — they can re-apply if needed.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search applicants…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                    />
                </div>

                {/* Content */}
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl shimmer" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3.5 w-32 rounded shimmer" />
                                        <div className="h-3 w-24 rounded shimmer" />
                                    </div>
                                </div>
                                <div className="h-3 w-full rounded shimmer" />
                                <div className="h-3 w-3/4 rounded shimmer" />
                                <div className="flex gap-2 pt-1">
                                    <div className="h-9 flex-1 rounded-xl shimmer" />
                                    <div className="h-9 flex-1 rounded-xl shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl border border-red-100 p-10 text-center shadow-sm">
                        <p className="text-red-500 font-medium">{error}</p>
                        <button onClick={fetchPending} className="mt-3 text-blue-600 text-sm underline cursor-pointer">
                            Try again
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-gray-800 font-semibold text-lg">All caught up!</h3>
                        <p className="text-gray-400 text-sm mt-1">
                            {search ? "No applicants match your search." : "No pending provider applications at the moment."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((provider, idx) => {
                            const user = getUser(provider);
                            const isLoading = actionLoading === provider.id;
                            return (
                                <div
                                    key={provider.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden card-enter"
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                >
                                    {/* Card Header */}
                                    <div className="p-5 pb-4">
                                        <div className="flex items-start gap-3">
                                            <Avatar provider={provider} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {provider.businessName}
                                                </h3>
                                                {user && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                Pending
                                            </span>
                                        </div>

                                        {/* Meta */}
                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                <span className="truncate">{provider.location || "—"}</span>
                                            </div>

                                            {user?.name && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span className="truncate">{user.name}</span>
                                                </div>
                                            )}

                                            {provider.createdAt && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>
                                                        Applied{" "}
                                                        {new Date(provider.createdAt).toLocaleDateString("en-US", {
                                                            month: "short", day: "numeric", year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {provider.description && (
                                            <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed border-t border-gray-50 pt-3">
                                                {provider.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="px-5 pb-5">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-2.5 gap-2 text-sm text-gray-400">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                                Processing…
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setModal({ open: true, type: "approve", provider })}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setModal({ open: true, type: "reject", provider })}
                                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-red-50 text-red-600 border border-red-200 transition cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination (if needed) */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
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