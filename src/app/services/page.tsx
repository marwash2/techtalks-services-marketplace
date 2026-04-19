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
  categoryId?: { name?: string } | string | null;
  providerId?: { location?: string; businessName?: string } | string | null;
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
      {services.map((service, index) => {
        const uniqueKey = service._id || index;

        return (
          <ServiceCard
            key={uniqueKey}
            service={{
              id: service._id,
              title: service.title,
              description: service.description,
              price: service.price,
              duration: service.duration,
              image: service.image,
              categoryId: service.categoryId,
              providerId: service.providerId,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Page() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER SECTION */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Services</h1>

        {/* Mobile Filter Toggle Button (Hidden on Desktop) */}
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* DESKTOP FILTERS: Hidden on mobile */}
          <div className="hidden lg:block w-64 shrink-0">
            <Filters />
          </div>

          {/* MOBILE FILTERS MODAL/DRAWER */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] flex lg:hidden">
              {/* Dark transparent backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={() => setIsMobileFiltersOpen(false)}
              />

              {/* Slide-out drawer panel */}
              <div className="relative mr-auto flex h-full w-full max-w-xs flex-col bg-white shadow-xl">
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                  <h2 className="text-lg font-semibold text-gray-900">Filter Services</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Filter Component injected inside the drawer */}
                <div className="flex-1 overflow-hidden p-4">
                  {/* Passing the onClose prop here triggers the button to show! */}
                  <Filters onClose={() => setIsMobileFiltersOpen(false)} />
                </div>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col gap-4">
            <SearchBar />
            <ServicesContent />
          </div>
        </div>
      </Suspense>
    </div>
  );
}