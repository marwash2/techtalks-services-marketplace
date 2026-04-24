"use client";

import { ChevronLeft } from "lucide-react";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ServiceCard from "@/components/services/ServiceCard";
import EmptyState from "@/components/shared/EmptyState";
import Loader from "@/components/shared/Loader";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

type Service = {
  _id: string;
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

function ServicesContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const categoryQuery = `category=${slug}`;
      const query = searchParams.toString();
      const finalQuery = query ? `${query}&${categoryQuery}` : categoryQuery;
      const res = await fetch(`/api/services?${finalQuery}`);
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
  }, [searchParams, slug]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        title="No services found"
        description="No services available in this category yet. Check back later or browse other categories."
      />
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
            providerId: service.providerId ?? null,
            categoryId: service.categoryId ?? null,
          }}
        />
      ))}
    </div>
  );
}

function capitalize(str: string) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const categoryTitle = capitalize(slug || "category");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-4 font-medium"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to all services
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {categoryTitle} Services
            </h1>
            <p className="text-xl text-gray-600">
              Find top rated {categoryTitle.toLowerCase()} providers near you
            </p>
          </div>
        </div>
      </div>

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
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <Filters onClose={() => setIsMobileFiltersOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm mb-4"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
          <SearchBar />
          <ServicesContent slug={slug} />
        </div>
      </div>
    </div>
  );
}
