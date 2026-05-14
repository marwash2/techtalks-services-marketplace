"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  BriefcaseBusiness,
  DollarSign,
  Clock3,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";

type Service = {
  id: string;
  title: string;
  price: number;
  duration: number;
  category?: {
    name?: string;
  } | null;
};

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?dashboard=true", {
        credentials: "include",
      });

      const data = await res.json();

      setServices(data.data?.services || []);
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const confirmDeleteService = async () => {
    if (!selectedServiceId) return;

    try {
      const res = await fetch(`/api/services/${selectedServiceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(errorData.message || "Delete failed");
      }

      setServices((prev) =>
        prev.filter((service) => service.id !== selectedServiceId),
      );

      setShowDeleteModal(false);

      setSelectedServiceId(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete service");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
              Provider
            </p>

            <h1 className="text-3xl font-semibold text-slate-950">Services</h1>

            <p className="mt-1.5 text-sm text-slate-500 leading-6 max-w-xl">
              Manage your services, pricing, and booking details.
            </p>
          </div>

          <Link
            href="/provider/services/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Link>
        </div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 md:grid-cols-3">
          <StatCard
            title="Total Services"
            value={services.length}
            icon={<BriefcaseBusiness className="h-5 w-5 text-blue-600" />}
          />

          <StatCard
            title="Active Services"
            value={services.length}
            icon={<BriefcaseBusiness className="h-5 w-5 text-emerald-600" />}
          />

          <StatCard
            title="Starting Price"
            value={`$${
              services.length > 0
                ? Math.min(...services.map((s) => s.price))
                : 0
            }`}
            icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
          />
        </div>

        {/* SERVICES */}
        <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-900">
              All Services
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your available services.
            </p>
          </div>

          {/* CONTENT */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Loading services...
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <BriefcaseBusiness className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  No services yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Start by creating your first service.
                </p>
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-5 px-6 py-5 transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
                >
                  {/* LEFT */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {service.title}
                      </h3>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {service.category?.name || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-blue-500" />$
                        {service.price}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-indigo-500" />
                        {service.duration} mins
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/provider/services/edit_page/${service.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedServiceId(service.id);

                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[22px] border border-slate-200 bg-white p-7 shadow-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Delete Service
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to permanently delete this service? This
              action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);

                  setSelectedServiceId(null);
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteService}
                className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white px-5 py-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
        {icon}
      </div>

      <h3 className="text-3xl font-semibold text-slate-900">{value}</h3>

      <p className="mt-1 text-sm text-slate-500">{title}</p>
    </div>
  );
}
