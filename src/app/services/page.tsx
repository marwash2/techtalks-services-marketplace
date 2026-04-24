"use client";

import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ServiceCard from "@/components/services/ServiceCard";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";

type Service = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;

<<<<<<< HEAD
  providerId?: {
=======
  provider?: {
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
    location?: string;
    businessName?: string;
  } | null;

<<<<<<< HEAD
  categoryId?: {
=======
  category?: {
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
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
<<<<<<< HEAD
      <div className="text-center py-10 text-gray-400">Loading services...</div>
=======
      <div className="text-center py-10 text-gray-400">
        Loading services...
      </div>
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
    );
  }

  if (services.length === 0) {
    return (
<<<<<<< HEAD
      <div className="text-center py-10 text-gray-400">No services found</div>
=======
      <div className="text-center py-10 text-gray-400">
        No services found
      </div>
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service._id}
          service={{
            id: service._id,
            title: service.title,
            description: service.description,
            price: service.price,
            duration: service.duration,
            image: service.image,
<<<<<<< HEAD
            providerId: service.providerId ?? null,
            categoryId: service.categoryId ?? null,
=======
            provider: service.provider ?? null,
            category: service.category ?? null,
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
          }}
        />
      ))}
    </div>
  );
<<<<<<< HEAD
}

export default function Page() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Services</h1>

        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* DESKTOP FILTERS */}
          <div className="hidden lg:block w-64 shrink-0">
            <Filters />
          </div>

          {/* MOBILE FILTERS */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              <div
                className="fixed inset-0 bg-slate-900/50"
                onClick={() => setIsMobileFiltersOpen(false)}
              />

              <div className="relative mr-auto h-full w-full max-w-xs bg-white">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)}>
                    <X />
                  </button>
                </div>

                <div className="p-4">
                  <Filters onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* MAIN */}
          <div className="flex-1 flex flex-col gap-4">
            <SearchBar />
            <ServicesContent />
          </div>
        </div>
      </Suspense>
    </div>
  );
=======
>>>>>>> a9c78dde948a82d8e900b71a4669c036268e87ea
}

export default function Page() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Services</h1>

        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* DESKTOP FILTERS */}
          <div className="hidden lg:block w-64 shrink-0">
            <Filters />
          </div>

          {/* MOBILE FILTERS */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              <div
                className="fixed inset-0 bg-slate-900/50"
                onClick={() => setIsMobileFiltersOpen(false)}
              />

              <div className="relative mr-auto h-full w-full max-w-xs bg-white">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)}>
                    <X />
                  </button>
                </div>

                <div className="p-4">
                  <Filters onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* MAIN */}
          <div className="flex-1 flex flex-col gap-4">
            <SearchBar />
            <ServicesContent />
          </div>

        </div>
      </Suspense>
    </div>
  );
}