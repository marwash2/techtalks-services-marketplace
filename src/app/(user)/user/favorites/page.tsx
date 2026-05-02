"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Star } from "lucide-react";
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
  if (!item.service || typeof item.service === "string") return null;
  return item.service;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/favorites?limit=50", { cache: "no-store" });
        const data: FavoritesApiResponse = await res.json();

        if (!res.ok || data.success === false) {
          throw new Error(data.message || "Failed to load favorites");
        }

        const items = data.data?.favorites || data.favorites || [];
        setFavorites(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load favorites");
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
    const res = await fetch(`/api/favorites/${serviceId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Failed to remove favorite");
    }

    setFavorites((prev) =>
      prev.filter((item) => {
        const service = getService(item);
        return service?.id !== serviceId;
      })
    );

    // ✅ TOAST SUCCESS
    toast.success("Removed from favorites 💔");

  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to remove favorite";

    setError(message);

    // ❌ TOAST ERROR
    toast.error(message);
  } finally {
    setRemovingServiceId(null);
  }
}

  const sortedFavorites = useMemo(() => {
    const items = [...favorites];
    if (sortBy === "price-low") {
      return items.sort((a, b) => {
        const left = getService(a)?.price ?? Number.MAX_SAFE_INTEGER;
        const right = getService(b)?.price ?? Number.MAX_SAFE_INTEGER;
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
        const left = getService(a)?.averageRating ?? 0;
        const right = getService(b)?.averageRating ?? 0;
        return right - left;
      });
    }
    return items.sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }, [favorites, sortBy]);

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Loader />
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-700">
          Could not load favorites
        </h2>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      </section>
    );
  }

  return (
  <section className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm">
    
    {/* Header */}
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      
      <div>
        <h2 className="flex items-center gap-3 text-3xl font-bold text-slate-900">
          <div className="rounded-xl bg-rose-100 p-2">
            <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
          </div>
          My Favorites
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your saved services for quick access anytime
        </p>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Sort by</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none cursor-pointer"
        >
          <option value="recent">Recently Added</option>
          <option value="price-low">Price: Low → High</option>
          <option value="price-high">Price: High → Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>

    {/* Count badge */}
    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full bg-blue-500"></span>
      {sortedFavorites.length} Saved Services
    </div>

    {/* Empty state */}
    {sortedFavorites.length === 0 ? (
      <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="text-xl font-semibold text-slate-900">
          No favorites yet
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Start exploring services and save the ones you like.
        </p>

        <Link
          href="/user/services"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
        >
          Explore Services
        </Link>
      </div>
    ) : (
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedFavorites.map((favorite) => {
          const service = getService(favorite);
          if (!service) return null;

          return (
            <article
              key={favorite.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg "
            >
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center px-4">
                    <p className="text-sm font-semibold text-slate-600">
                      {service.title}
                    </p>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(service.id)}
                  disabled={removingServiceId === service.id}
                  className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition hover:bg-white cursor-pointer"
                >
                  <Heart className="h-5 w-5 fill-rose-500 text-rose-500 cursor-pointer" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 p-5">
                <Link
                  href={`/services/${service.id}`}
                  className="line-clamp-2 text-lg font-semibold text-slate-900 transition hover:text-blue-600"
                >
                  {service.title}
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {service.averageRating?.toFixed(1) ?? "0.0"}
                    <span className="text-slate-400">
                      ({service.reviewCount ?? 0})
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-600">
                      {formatPrice(service.price)}
                    </p>
                    <p className="text-xs text-slate-400">starting price</p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}
  </section>
);
}
