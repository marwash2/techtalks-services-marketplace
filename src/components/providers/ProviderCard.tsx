import Link from "next/link";
import { ArrowUpRight, BadgeCheck, MapPin, Star } from "lucide-react";

import { Routes } from "@/constants/routes";

type ProviderCardProps = {
  provider: {
    id: string;
    userId?: { name?: string } | string | null;
    businessName?: string;
    description?: string;
    location?: string;
    rating?: number;
    isVerified?: boolean;
    totalReviews?: number;
    avatar?: string | null;
  };
};

function getProviderName(provider: ProviderCardProps["provider"]) {
  if (typeof provider.userId === "object" && provider.userId?.name) {
    return provider.userId.name;
  }

  return provider.businessName || "Provider";
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const providerName = getProviderName(provider);
  const providerInitial = providerName.charAt(0).toUpperCase() || "P";

  return (
    <article className="h-full flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {" "}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 p-6 overflow-hidden">
        {" "}
        <div className="flex items-start gap-4 min-w-0">
          {provider.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.avatar}
              alt={providerName}
              className="h-18 w-18 h-[72px] w-[72px] rounded-3xl object-cover"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-3xl bg-blue-600 text-2xl font-semibold text-white">
              {providerInitial}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 max-w-full">
              <h2 className="truncate text-xl font-semibold text-slate-900">
                {providerName}
              </h2>
              {provider.isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm font-medium text-slate-500">
              {provider.businessName || "Independent Provider"}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 max-w-full">
              {" "}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                {provider.location || "Location not available"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                <Star className="h-3.5 w-3.5 text-blue-600" />
                {provider.rating?.toFixed(1) || "New"} rating
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-7 text-slate-600">
          {provider.description ||
            "This provider has not added a short description yet."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            {provider.totalReviews
              ? `${provider.totalReviews} reviews`
              : "No reviews yet"}
          </p>
          <Link
            href={Routes.PROVIDER_DETAILS(provider.id)}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            View profile
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
