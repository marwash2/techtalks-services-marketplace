"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Heart,
  Star,
  Sparkles,
  BriefcaseBusiness,
  SlidersHorizontal,
  CircleDollarSign,
  BadgeCheck,
  ArrowUpDown,
  Search,
  Trash2,
} from "lucide-react";

import Loader from "@/components/shared/Loader";
import toast from "react-hot-toast";

type FavoriteService = {
  id: string;
  title: string;
  price?: number;
  averageRating?: number;
  reviewCount?: number;
  image?: string | null;
};

type FavoriteItem = {
  id: string;
  userId: string;
  service: FavoriteService | string;
  createdAt?: string;
};

type FavoritesApiResponse = {
  success?: boolean;
  data?: {
    favorites?: FavoriteItem[];
  };
  favorites?: FavoriteItem[];
  message?: string;
};

function formatPrice(value?: number) {
  if (!value && value !== 0) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getService(item: FavoriteItem): FavoriteService | null {
  if (!item.service || typeof item.service === "string") {
    return null;
  }

  return item.service;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<
    FavoriteItem[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("recent");

  const [removingServiceId, setRemovingServiceId] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          "/api/favorites?limit=50",
          {
            cache: "no-store",
          }
        );

        const data: FavoritesApiResponse =
          await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(
            data.message || "Failed to load favorites"
          );
        }

        const items =
          data.data?.favorites ||
          data.favorites ||
          [];

        setFavorites(items);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load favorites"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, []);

  async function removeFavorite(serviceId: string) {
    if (!serviceId || removingServiceId) return;

    setRemovingServiceId(serviceId);

    try {
      const res = await fetch(
        `/api/favorites/${serviceId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to remove favorite"
        );
      }

      setFavorites((prev) =>
        prev.filter((item) => {
          const service = getService(item);

          return service?.id !== serviceId;
        })
      );

      toast.success("Removed from favorites 💔");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to remove favorite";

      setError(message);

      toast.error(message);
    } finally {
      setRemovingServiceId(null);
    }
  }

  const sortedFavorites = useMemo(() => {
    const items = [...favorites];

    if (sortBy === "price-low") {
      return items.sort((a, b) => {
        const left =
          getService(a)?.price ??
          Number.MAX_SAFE_INTEGER;

        const right =
          getService(b)?.price ??
          Number.MAX_SAFE_INTEGER;

        return left - right;
      });
    }

    if (sortBy === "price-high") {
      return items.sort((a, b) => {
        const left = getService(a)?.price ?? 0;

        const right = getService(b)?.price ?? 0;

        return right - left;
      });
    }

    if (sortBy === "rating") {
      return items.sort((a, b) => {
        const left =
          getService(a)?.averageRating ?? 0;

        const right =
          getService(b)?.averageRating ?? 0;

        return right - left;
      });
    }

    return items.sort((a, b) => {
      const left = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const right = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return right - left;
    });
  }, [favorites, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center">
        <div className="bg-white border border-blue-100 rounded-3xl p-8 shadow-sm">
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center px-4">
        <div className="bg-white border border-red-200 rounded-3xl p-8 max-w-md w-full text-center">

          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Heart className="w-7 h-7 text-red-500" />
          </div>

          <h2 className="text-xl font-bold text-red-600 mb-2">
            Failed to Load Favorites
          </h2>

          <p className="text-sm text-red-500">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">

          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">

            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Heart className="w-3 h-3 fill-blue-600" />
              Favorite Services
            </span>

            <h1
              className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
              style={{
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              My Favorites
            </h1>

            <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl mb-6">
              Access all your saved services in one
              elegant place and quickly return to the
              providers and services you love most.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-2.5">

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                {sortedFavorites.length} Saved
                Service
                {sortedFavorites.length !== 1
                  ? "s"
                  : ""}
              </span>

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                Trusted Providers
              </span>

              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Personalized Collection
              </span>

            </div>
          </div>
        </section>

        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div>
            <h2
              className="text-2xl text-[#1e3a5f] mb-1"
              style={{
                fontFamily:
                  "'DM Serif Display', serif",
              }}
            >
              Saved Services
            </h2>

            <p className="text-sm text-[#6b93c4]">
              Manage and explore your favorite services
            </p>
          </div>

          {/* SORT */}
          <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-2xl px-4 py-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[#7c9bc0] font-semibold mb-1">
                Sort By
              </p>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="bg-transparent text-sm font-medium text-[#1e3a5f] outline-none cursor-pointer"
              >
                <option value="recent">
                  Recently Added
                </option>

                <option value="price-low">
                  Price: Low → High
                </option>

                <option value="price-high">
                  Price: High → Low
                </option>

                <option value="rating">
                  Top Rated
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* EMPTY */}
        {sortedFavorites.length === 0 ? (
          <div className="bg-white border-[1.5px] border-dashed border-blue-200 rounded-3xl px-6 py-16 text-center">

            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Heart className="w-7 h-7 text-blue-400" />
            </div>

            <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">
              No favorites yet
            </h2>

            <p className="text-sm text-[#6b93c4] leading-relaxed max-w-sm mx-auto">
              Start exploring services and save the
              ones you like to access them later.
            </p>

            <Link
              href="/user/services"
              className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 transition text-white rounded-full px-5 py-3 text-sm font-semibold"
            >
              <Search className="w-4 h-4" />
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {sortedFavorites.map((favorite) => {
              const service = getService(favorite);

              if (!service) return null;

              return (
                <article
                  key={favorite.id}
                  className="group overflow-hidden bg-white border-[1.5px] border-blue-100 rounded-3xl hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                >

                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-blue-50">

                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">

                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                          <BriefcaseBusiness className="w-7 h-7 text-blue-500" />
                        </div>

                        <p className="text-sm font-semibold text-[#1e3a5f]">
                          {service.title}
                        </p>
                      </div>
                    )}

                    {/* REMOVE */}
                    <button
                      onClick={() =>
                        removeFavorite(service.id)
                      }
                      disabled={
                        removingServiceId ===
                        service.id
                      }
                      className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-105 transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>

                    {/* GRADIENT */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1">

                    <div className="mb-5">
                      <Link
                        href={`/services/${service.id}`}
                        className="text-xl font-semibold text-[#1e3a5f] hover:text-blue-600 transition line-clamp-2 min-h-[56px] block"
                      >
                        {service.title}
                      </Link>
                    </div>

                    {/* STATS */}
                    <div className="flex items-center justify-between mb-6">

                      <div className="flex items-center gap-2">

                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-[#1e3a5f]">
                            {service.averageRating?.toFixed(
                              1
                            ) || "0.0"}
                          </p>

                          <p className="text-xs text-[#7c9bc0]">
                            {service.reviewCount || 0}{" "}
                            reviews
                          </p>
                        </div>

                      </div>

                      <div className="text-right">

                        <div className="inline-flex items-center gap-1 text-blue-600 font-bold text-2xl">
                          <CircleDollarSign className="w-5 h-5" />
                          {service.price || 0}
                        </div>

                        <p className="text-xs text-[#7c9bc0]">
                          starting price
                        </p>
                      </div>

                    </div>

                    {/* BUTTON */}
                    <Link
                      href={`/services/${service.id}`}
                      className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-2xl py-3 text-sm font-semibold mt-auto"
                    >
                      View Service
                      <ArrowUpDown className="w-4 h-4" />
                    </Link>

                  </div>
                </article>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}