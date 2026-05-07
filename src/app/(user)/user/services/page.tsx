"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ServiceCard from "@/components/services/ServiceCard";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import { SlidersHorizontal, Star, X } from "lucide-react";

type Service = {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  providerId?: {
    _id?: string;
    id?: string;
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
  const [reviewService, setReviewService] = useState<Service | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/services?${query}`, {
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

  const openReviewModal = (service: Service) => {
    setReviewService(service);
    setReviewRating(5);
    setReviewComment("");
    setReviewError("");
    setReviewSuccess("");
  };

  const closeReviewModal = () => {
    if (reviewSubmitting) return;
    setReviewService(null);
    setReviewComment("");
    setReviewError("");
  };

  const handleSubmitReview = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!reviewService) return;

    const serviceId = reviewService._id || reviewService.id || "";
    const providerId =
      reviewService.providerId?._id || reviewService.providerId?.id || "";

    if (!serviceId || !providerId) {
      setReviewError("Service or provider information is missing.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a short comment.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          providerId,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to add review");
      }

      setReviewService(null);
      setReviewComment("");
      setReviewRating(5);
      setReviewSuccess("Review added successfully.");
    } catch (err) {
      setReviewError(
        err instanceof Error
          ? err.message
          : "Something went wrong while adding your review",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      {reviewSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {reviewSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => {
          const serviceId = service._id || service.id || "";
          const providerId = service.providerId?._id || service.providerId?.id;
          const canReview = Boolean(serviceId && providerId);

          return (
            <div key={serviceId || index} className="flex h-full flex-col gap-3">
              <ServiceCard
                showFavorite
                service={{
                  _id: serviceId,
                  title: service.title,
                  description: service.description,
                  price: service.price,
                  duration: service.duration,
                  image: service.image,
                  providerId: service.providerId ?? null,
                  categoryId: service.categoryId ?? null,
                }}
              />
              <button
                type="button"
                onClick={() => openReviewModal(service)}
                disabled={!canReview}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
              >
                <Star className="h-4 w-4" />
                Write a review
              </button>
            </div>
          );
        })}
      </div>

      {reviewService && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Write a review
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Share your experience with {reviewService.title}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-900">Rating</p>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => {
                        setReviewRating(rating);
                        setReviewError("");
                      }}
                      className="rounded-lg p-1 transition hover:bg-yellow-50"
                      aria-label={`${rating} star rating`}
                    >
                      <Star
                        className={`h-7 w-7 ${
                          rating <= reviewRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-700">
                    {reviewRating}.0
                  </span>
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-semibold text-slate-900">
                  Comment
                </span>
                <textarea
                  value={reviewComment}
                  onChange={(event) => {
                    setReviewComment(event.target.value);
                    setReviewError("");
                  }}
                  rows={5}
                  placeholder="Tell others what went well..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              {reviewError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reviewError}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {reviewSubmitting ? "Submitting..." : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
