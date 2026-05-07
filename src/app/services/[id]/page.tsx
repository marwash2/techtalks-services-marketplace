"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import { useSession } from "next-auth/react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Leaf,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Share2,
  Sparkles,
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
  averageRating?: number;
  reviewCount?: number;
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

const includedItems = [
  "Dusting all surfaces",
  "Vacuuming & mopping",
  "Kitchen cleaning",
  "Bathroom sanitizing",
  "Trash removal",
];

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

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [providerReviews, setProviderReviews] = useState<ProviderReview[]>([]);
  const [providerReviewCount, setProviderReviewCount] = useState(0);
  const [providerAverageRating, setProviderAverageRating] = useState(0);
  const [showAllProviderReviews, setShowAllProviderReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState("");

  const { data: session } = useSession();

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
        `/api/reviews?providerId=${providerId}&limit=${limit}`,
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
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();

        const serviceDetail = data.data.service || data.service;
        setService(serviceDetail);

        const providerId = serviceDetail ? getProviderId(serviceDetail) : "";
        if (providerId) {
          await fetchProviderReviews(providerId, 3);
        }
      } catch {
        setError("Service not found");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchService();
  }, [id]);

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

  const handleProtectedAction = (action: () => void, actionName: string) => {
    if (!session) {
      setLoginAction(actionName);
      setShowLoginModal(true);
      return;
    }

    action();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading service...
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          title="Service not found"
          description="The service you are looking for does not exist or has been removed."
        />
      </div>
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
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                      ? Sparkles
                      : index === 1
                        ? Leaf
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
                Book this service
              </h2>

              <div className="mt-5">
                <p className="text-sm text-slate-500">Starting from</p>
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
                  <Clock3 className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Availability</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {service.availability || "Availability not set"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <MessageCircle className="mt-1 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      Response time
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Usually within 30 minutes
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 space-y-3">
                <button
                  onClick={() =>
                    handleProtectedAction(() => {
                      router.push(`/bookings/${serviceId}`);
                    }, "book this service")
                  }
                  className="h-12 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Book Now
                </button>
                <button
                  onClick={() =>
                    handleProtectedAction(() => {
                      router.push(
                        providerId ? `/providers/${providerId}` : "/providers",
                      );
                    }, "message this provider")
                  }
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message Provider
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-slate-950">
                What&apos;s included
              </h3>
              <div className="mt-4 space-y-3">
                {includedItems.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-bold text-slate-950">
                Cancellation policy
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Free cancellation up to 24 hours before the service.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-950">
              Login Required
            </h2>
            <p className="mt-3 leading-7 text-slate-600">
              Please log in or create an account to continue and {loginAction}.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Maybe Later
              </button>
              <Link
                href="/login"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
