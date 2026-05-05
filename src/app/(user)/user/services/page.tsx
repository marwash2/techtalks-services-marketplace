"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/services/ServiceCard";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import { SlidersHorizontal, X } from "lucide-react";

type Service = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  providerId?: {
    location?: string;
    businessName?: string;
  } | null;
  categoryId?: {
    name?: string;
  } | null;
};

function ServicesContent() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const location = searchParams.get("location");
        const maxPrice = searchParams.get("maxPrice");
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (location) params.set("location", location);
        if (maxPrice) params.set("maxPrice", maxPrice);
        const query = params.toString();
        const res = await fetch(`/api/services${query ? `?${query}` : ""}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load services");
        }
        setServices(data?.data?.services || data?.services || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-400">Loading services...</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h2 className="text-lg font-semibold text-rose-700">
          Could not load services
        </h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return <p className="py-10 text-center text-gray-400">No services found</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service, index) => (
        <ServiceCard
          key={service._id || service.id || index}
          showFavorite
          service={{
            _id: service._id || service.id,
            title: service.title,
            description: service.description,
            price: service.price,
            duration: service.duration,
            image: service.image,
            providerId: service.providerId ?? null,
            categoryId: service.categoryId ?? null,
          }}
        />
      ))}
    </div>
  );
}

export default function UserServicesPage() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">All Services</h2>
          <p className="mt-1 text-sm text-slate-600">
            Explore services and save your favorites.
          </p>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col gap-6 lg:flex-row">
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              <div
                className="fixed inset-0 bg-slate-900/50"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <div className="relative mr-auto h-full w-full max-w-xs bg-white">
                <div className="flex items-center justify-between border-b p-4">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)}>
                    <X className="cursor-pointer" />
                  </button>
                </div>
                <div className="p-4">
                  <Filters onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-1 flex-col gap-4">
            <SearchBar />
            <ServicesContent />
          </div>
        </div>
      </Suspense>

      {isMobileFiltersOpen && (
  <div className="fixed inset-0 z-[100] flex">

    {/* overlay */}
    <div
      className="fixed inset-0"
      onClick={() => setIsMobileFiltersOpen(false)}
    />

    {/* LEFT DRAWER */}
    <div className="relative h-full w-full max-w-xs bg-white shadow-xl animate-slide-in-left">
      
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-semibold">Filters</h2>

        <button onClick={() => setIsMobileFiltersOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4">
        <Filters onClose={() => setIsMobileFiltersOpen(false)} />
      </div>
    </div>

  </div>
)}
    </section>
  );
}
