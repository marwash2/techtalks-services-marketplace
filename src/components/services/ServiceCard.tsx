"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, Heart, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { Routes } from "@/constants/routes";

type ServiceCardProps = {
  service: {
    _id: string;
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
  const serviceId = service._id || service._id || "";
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
       group flex flex-col  rounded-3xl border border-slate-300 hover:border-primary/50 shadow-sm bg-gray-50 transition-all duration-300 overflow-hidden h-full  hover:-translate-y-1 hover:shadow-xl"
    >
      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <img
            src="/noimage.jpeg"
            alt={service.title}
            className="w-full  h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full ">
          <span className="text-xs font-semibold text-blue-500  tracking-wider ">
            {categoryName}
          </span>
        </div>

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
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="min-w-0 flex-1">
          {/* 🆕 AIRBNB-STYLE BADGES */}
          {/* TITLE */}
          <h3 className="text-md font-semibold text-slate-900 loading-snug line-clamp-2 min-h-[2rem]">
            {service.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="mt-2 line-clamp-3 min-h-[3.5rem] text-sm leading-relaxed text-slate-500">
            {service.description || "Service details will be added soon."}
          </p>
          <div className="mt-auto pt-6 bg-gray-100 shadow-sm border border-gray-200 shadow-gray-200  px-4 rounded-2xl flex items-center justify-between">
            {/* META (price + duration unchanged style) */}
            <div className="mb-3 flex flex-wrap gap-2 text-sm text-slate-500 max-w-full">
              <span className="inline-flex items-center gap-1.5   px-1 py-1 rounded-full text-sm text-slate-600 ">
                <Clock3 className="h-4 w-4 text-blue-600" />
                {service.duration} min
              </span>
            </div>
            <div className="text-right mb-3 flex flex-wrap gap-2 max-w-full">
              <span className="inline-flex items-center gap-1.5   px-1 py-1 rounded-full text-xl  font-semibold">
                {formatCurrency(service.price)}
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-5 flex items-center justify-between mt-auto  pt-2 ">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 px-5 truncate pr-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </p>

          <Link
            href={Routes.SERVICE_DETAILS(service._id)}
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
