"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock3, MapPin } from "lucide-react";

export default function AdminServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchService() {
      try {
        const res = await fetch(`/api/services/${params.id}`, { cache: "no-store" });
        const data = await res.json();
        setService(data?.data?.service ?? null);
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [params.id]);

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading service...</div>;
  if (!service) return <div className="p-6 text-sm text-red-500">Service not found.</div>;

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Details</h1>
          <p className="mt-1 text-sm text-slate-500">Full service data in admin view.</p>
        </div>
        <Link
          href={`/admin/services/${service.id}/edit`}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Edit Service
        </Link>
      </div>

      <article className="overflow-hidden rounded-3xl border border-slate-300 bg-gray-50 shadow-sm">
        <div className="h-64 w-full bg-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={service.image || "/noimage.jpeg"}
            alt={service.title || "Service image"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">{service.title || "-"}</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {service.category?.name || service.categoryId?.name || "Service"}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-slate-600">
            {service.description || "No description provided."}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Price</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">${service.price ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Provider</p>
              <p className="mt-1 font-medium text-slate-900">
                {service.provider?.businessName || service.providerId?.businessName || "-"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Duration</p>
              <p className="mt-1 inline-flex items-center gap-1 font-medium text-slate-900">
                <Clock3 className="h-4 w-4 text-blue-600" />
                {service.duration ?? 0} min
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
              <p className="text-xs uppercase text-slate-500">Location</p>
              <p className="mt-1 inline-flex items-center gap-1 font-medium text-slate-900">
                <MapPin className="h-4 w-4 text-blue-600" />
                {service.provider?.location ||
                  service.providerId?.location ||
                  service.location ||
                  "-"}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

