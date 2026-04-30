"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, Heart, MapPin, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Routes } from "@/constants/routes";

type ServiceCardProps = {
  service: {
    _id?: string;
    id?: string;
    title: string;
    description?: string;
    price: number;
    duration: number;
    image?: string | null;

    categoryId?: {
      name?: string;
    } | null;

    providerId?: {
      location?: string;
      businessName?: string;
    } | null;
  };
  showFavorite?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ServiceCard({
  service,
  showFavorite = false,
}: ServiceCardProps) {
  const serviceId = service._id || service.id || "";
  const categoryName = service.categoryId?.name || "Service";
  const location = service.providerId?.location || "Location not available";
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  

  useEffect(() => {
    let mounted = true;

    async function checkFavorite() {
      if (!showFavorite || !serviceId) return;
      try {
        const res = await fetch(`/api/favorites/${serviceId}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!mounted || !res.ok || data?.success === false) return;
        setIsFavorited(Boolean(data?.data?.favorited));
      } catch {
        // Keep non-favorited state when unauthenticated or on request error.
      }
    }

    checkFavorite();
    return () => {
      mounted = false;
    };
  }, [serviceId, showFavorite]);

 async function toggleFavorite() {
  if (!serviceId || favoriteBusy) return;
  setFavoriteBusy(true);

  try {
    if (isFavorited) {
      const res = await fetch(`/api/favorites/${serviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data?.success !== false) {
        setIsFavorited(false);
        toast.success("Removed from favorites 💔");
      }
      return;
    }

    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId }),
    });

    const data = await res.json();

    if (res.ok && data?.success !== false) {
      setIsFavorited(true);
      toast.success("Added to favorites ❤️");
    }
  } catch {
    toast.error("Something went wrong ❌");
  } finally {
    setFavoriteBusy(false);
  }
}

  return (
    <article
      className="
        h-full flex flex-col overflow-hidden rounded-2xl
        bg-white shadow-md border border-slate-100
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
      "
    >
      {/* IMAGE */}
      <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">
              {service.title}
            </p>
          </div>
        )}

        {showFavorite && (
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={favoriteBusy}
            aria-label={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
            className="absolute right-3 top-3 rounded-xl bg-white/95 p-2 shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Heart
              className={`h-5 w-5 cursor-pointer ${
                isFavorited ? "fill-rose-500 text-rose-500 " : "text-slate-500"
              }`}
            />
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="min-w-0 flex-1">
          {/* 🆕 AIRBNB-STYLE BADGES */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            {/* Category Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium ring-1 ring-slate-200">
              <Tag className="h-3.5 w-3.5 text-blue-500" />
              {categoryName}
            </span>

            {/* Location Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium ring-1 ring-slate-200">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              {location}
            </span>
          </div>

          {/* META (price + duration unchanged style) */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 max-w-full">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 rounded-full text-xs text-slate-600 ">
              <Clock3 className="h-3.5 w-3.5 text-blue-600" />
              {service.duration} min
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 rounded-full text-xs text-blue-600 font-semibold">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              {formatCurrency(service.price)}
            </span>
          </div>

          {/* TITLE */}
          <h3 className="text-lg font-semibold text-slate-900 loading-snug line-clamp-2 min-h-[3.5rem]">
            {service.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-relaxed text-slate-500">
            {service.description || "Service details will be added soon."}
          </p>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between mt-auto pt-4 ">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 truncate pr-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </p>

          <Link
            href={Routes.SERVICE_DETAILS(serviceId)}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            View details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
