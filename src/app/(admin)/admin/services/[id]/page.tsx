"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

interface ServiceDetail {
  _id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  tags?: string[];
  availability: string;
  categoryId: { name: string };
  providerId: {
    id?: string;
    _id?: string;
    businessName: string;
    location: string;
    phone?: string;
    isVerified?: boolean;
    avatar?: string;
    joinedAt?: string;
    rating?: number;
    totalReviews?: number;
  };
}

interface ProviderReview {
  id: string;
  userId:
    | string
    | {
        id: string;
        name?: string;
        email?: string;
      };
  rating: number;
  comment?: string;
  createdAt?: string;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString();
}

function formatYear(value?: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.getFullYear();
}

function formatRating(value?: number) {
  return (value || 0).toFixed(1);
}

export default function AdminServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [providerReviews, setProviderReviews] = useState<ProviderReview[]>([]);
  const [providerReviewCount, setProviderReviewCount] = useState(0);
  const [providerAverageRating, setProviderAverageRating] = useState(0);
  const [showAllProviderReviews, setShowAllProviderReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const getProviderId = (serviceDetail: ServiceDetail) =>
    serviceDetail.providerId?._id || serviceDetail.providerId?.id || "";

  const getReviewerName = (review: ProviderReview) => {
    if (typeof review.userId === "object" && review.userId?.name) {
      return review.userId.name;
    }
    return "Customer";
  };

  const fetchProviderReviews = async (providerId: string, limit: number) => {
    setReviewsLoading(true);
    try {
      const reviewsRes = await fetch(
        `/api/reviews?providerId=${providerId}&limit=${limit}`
      );
      const reviewsData = await reviewsRes.json();

      if (reviewsRes.ok) {
        setProviderReviews(reviewsData.data?.reviews || []);
        setProviderReviewCount(reviewsData.data?.pagination?.total || 0);
        setProviderAverageRating(reviewsData.data?.summary?.averageRating || 0);
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      setProviderReviews([]);
      setProviderReviewCount(0);
      setProviderAverageRating(0);
      setShowAllProviderReviews(false);

      try {
        const res = await fetch(`/api/services/${params.id}`, { cache: "no-store" });
        const data = await res.json();

        const serviceDetail = data.data?.service || data.service;
        setService(serviceDetail);

        const providerId = serviceDetail ? getProviderId(serviceDetail) : "";
        if (providerId) {
          await fetchProviderReviews(providerId, 3);
        }
      } finally {
        setLoading(false);
      }
    }

    if (params.id) fetchService();
  }, [params.id]);

  const handleToggleProviderReviews = async () => {
    if (!service) return;

    const providerId = getProviderId(service);
    if (!providerId) return;

    if (showAllProviderReviews) {
      await fetchProviderReviews(providerId, 3);
      setShowAllProviderReviews(false);
      return;
    }

    await fetchProviderReviews(providerId, Math.max(providerReviewCount, 3));
    setShowAllProviderReviews(true);
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">Loading service...</div>
    );
  }

  if (!service) {
    return (
      <div className="p-6 text-sm text-red-500">Service not found.</div>
    );
  }

  const serviceId = service.id || service._id;
  const providerId = getProviderId(service);
  const visibleProviderReviews = showAllProviderReviews
    ? providerReviews
    : providerReviews.slice(0, 3);
  const image = service.image || "/hero.jpg";
  const providerRating =
    providerAverageRating || service.providerId?.rating || 0;
  const providerReviewsTotal =
    providerReviewCount || service.providerId?.totalReviews || 0;
  const serviceTags = service.tags?.length
    ? service.tags.slice(0, 4)
    : [
        "Deep Cleaning",
        "Eco Friendly",
        "Background Checked",
        "On-time Guarantee",
      ];

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div>
        {/* Back */}
        <Link
          href="/admin/services"
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Services
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Service Details</h1>
        <p className="mt-1 text-sm text-slate-500">Comprehensive service information</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0">
            <section className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={image}
                  alt={service.title}
                  className="h-[260px] w-full object-cover sm:h-[340px] lg:h-[360px]"
                />
              </div>
            </section>

            <section className="mt-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {service.title}
                  </h1>
                </div>

                {service.providerId?.isVerified && (
                  <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Verified Provider
                  </div>
                )}
              </div>

              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                {service.description || "Service details will be added soon."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                {serviceTags.map((tag, index) => {
                  const Icon =
                    index === 0
                      ? ShieldCheck
                      : index === 1
                        ? ShieldCheck
                        : index === 2
                          ? ShieldCheck
                          : BadgeCheck;

                  return (
                    <span
                      key={`${tag}-${index}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <Icon className="h-4 w-4 text-blue-600" />
                      {tag}
                    </span>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 rounded-2xl border border-slate-200 p-4 sm:p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-blue-100">
                    {service.providerId?.avatar ? (
                      <img
                        src={service.providerId.avatar}
                        alt={service.providerId.businessName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-blue-700">
                        {service.providerId?.businessName?.charAt(0) || "P"}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-950">
                        {service.providerId?.businessName || "Provider"}
                      </p>
                      {service.providerId?.isVerified && (
                        <BadgeCheck className="h-4 w-4 fill-blue-600 text-white" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Top Rated Provider
                    </p>
                    {providerId && (
                      <Link
                        href={`/providers/${providerId}`}
                        className="mt-2 inline-flex text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 md:min-w-[360px] md:justify-center md:text-right">
                  <div className="md:w-fit">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-950 md:justify-end">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {formatRating(providerRating)}
                    </div>
                    <p className="mt-1">{providerReviewsTotal} reviews</p>
                  </div>

                  <div className="md:w-fit">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-950 md:justify-end">
                      <MapPin className="h-4 w-4" />
                      {service.providerId?.location || "N/A"}
                    </div>
                    <p className="mt-1">
                      Member since {formatYear(service.providerId?.joinedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-8 border-t border-slate-100 pt-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">
                    Reviews ({providerReviewCount})
                  </h2>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {formatRating(providerRating)}
                  </span>
                </div>

                {providerReviewCount > 3 && (
                  <button
                    type="button"
                    onClick={handleToggleProviderReviews}
                    disabled={reviewsLoading}
                    className="w-fit text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {reviewsLoading
                      ? "Loading..."
                      : showAllProviderReviews
                        ? "Show fewer"
                        : "See all reviews"}
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {visibleProviderReviews.length > 0 ? (
                  visibleProviderReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-slate-950">
                          {getReviewerName(review)}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-slate-950">
                          {review.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="mt-3 leading-7 text-slate-600">
                        {review.comment || "No written comment."}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 p-5 text-slate-600">
                    This provider does not have reviews yet.
                  </div>
                )}
              </div>
            </section>
          </main>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-slate-200 p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Service Details
              </h2>

              <div className="mt-5">
                <p className="text-sm text-slate-500">Price</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-bold text-slate-950">
                    {formatCurrency(service.price)}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">/ service</span>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div className="flex gap-3">
                  <Clock3 className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Duration</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {service.duration} min
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {service.providerId?.location || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Availability</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {service.availability || "Availability not set"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <BadgeCheck className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Category</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {service.categoryId?.name || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

