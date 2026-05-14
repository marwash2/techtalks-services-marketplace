"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock3,
  Eye,
  MapPin,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { getServiceLocation } from "@/utils/service-location";

export default function ManageServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchServices() {
    try {
      const res = await fetch("/api/services?page=1&limit=100000");
      const data = await res.json();
      const list = data.data?.services || [];
      setServices(list);
      setFilteredServices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchServices();
  }, []);
  useEffect(() => {
    const filtered = services.filter((s) =>
      s.title?.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredServices(filtered);
  }, [search, services]);

  async function deleteService(id: string) {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        console.error("Failed to delete service");
        return;
      }

      await fetchServices();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteId(null);
    }
  }
  if (loading)
    return (
      <div className="p-6 text-sm text-slate-500">Loading services...</div>
    );

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Manage Services
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage all services listed on the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative mb-5 max-w-xl">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search services by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => {
            const serviceId = service.id || service._id;
            const categoryName =
              service.category?.name || service.categoryId?.name || "Service";
            const location =
              getServiceLocation(service, "") ||
              service.provider?.location ||
              service.providerId?.location ||
              "Location not available";
            const providerName =
              service.provider?.businessName ||
              service.providerId?.businessName ||
              "Unknown provider";

            return (
              <article
                key={serviceId}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-300 bg-gray-50 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image || "/noimage.jpeg"}
                    alt={service.title || "Service image"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm">
                    <span className="text-xs font-semibold tracking-wider text-blue-600">
                      {categoryName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 min-h-[2rem] text-md font-semibold text-slate-900">
                      {service.title || "Untitled service"}
                    </h3>
                    <p className="mt-2 line-clamp-3 min-h-[3.5rem] text-sm leading-relaxed text-slate-500">
                      {service.description ||
                        "Service details will be added soon."}
                    </p>
                    <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-100 px-4 pt-2 shadow-sm">
                      <span className="mb-2 inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock3 className="h-4 w-4 text-blue-600" />
                        {service.duration || 0} min
                      </span>
                      <span className="mb-2 text-xl font-semibold text-slate-900">
                        ${service.price ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-sm text-slate-500">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{location}</span>
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {providerName}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/services/${serviceId}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      View details
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/services/${serviceId}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                        title="View"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(serviceId)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
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
                Delete Service
              </h2>

              {/* Description */}
              <p className="mb-6 leading-relaxed text-gray-600">
                Are you sure you want to permanently delete this service?
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
                  Keep Service
                </button>

                {/* Confirm */}
                <button
                  onClick={() => deleteService(deleteId)}
                  className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {filteredServices.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No services found.
          </p>
        )}
      </div>
    </div>
  );
}
