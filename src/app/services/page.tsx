"use client";

import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ServiceCard from "@/components/services/ServiceCard";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

type Service = {
  _id: string;
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

  const fetchServices = async () => {
    setLoading(true);

    try {
      const query = searchParams.toString();
      const res = await fetch(`/api/services?${query}`);
      const data = await res.json();

      const servicesData = data.data?.services || data.services || [];
      console.log("SERVICES:", servicesData);
      setServices(servicesData);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">Loading services...</div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">No services found</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4  ">
      {services.map((service, index) => (
        <ServiceCard
          key={service._id || service.id || index}
          service={{
            _id: service._id || service.id || "",
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

export default function Page() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <Suspense fallback={<div>Loading...</div>}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-950">Services</h1>
              <p className="mt-2 text-sm text-slate-500">
                Browse trusted providers and filter by what matters.
              </p>
            </div>
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <div className="sticky top-24 h-[calc(100vh-7rem)]">
                <Filters />
              </div>
            </div>

            {isMobileFiltersOpen && (
              <div className="fixed inset-0 z-[100] flex lg:hidden">
                <div
                  className="fixed inset-0 bg-slate-900/50"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />

                <div className="relative mr-auto h-full w-full max-w-sm bg-white p-4 shadow-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-950">Filters</h2>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <Filters onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-4">
              <SearchBar />
              <ServicesContent />
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
