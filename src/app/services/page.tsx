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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
