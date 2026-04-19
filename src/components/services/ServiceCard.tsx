import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Tag } from "lucide-react";

import { Routes } from "@/constants/routes";

type ServiceCardProps = {
  service: {
    id: string;
    title: string;
    description?: string;
    price: number;
    duration: number;
    image?: string | null;
    categoryId?: { name?: string } | string | null;
    providerId?: { location?: string } | string | null;
  };
  providerLocation?: string;
};

function getCategoryName(service: ServiceCardProps["service"]) {
  if (typeof service.categoryId === "object" && service.categoryId?.name) {
    return service.categoryId.name;
  }
  return "Service";
}

function getServiceLocation(
  service: ServiceCardProps["service"],
  providerLocation?: string
) {
  if (
    typeof service.providerId === "object" &&
    service.providerId !== null &&
    service.providerId.location
  ) {
    return service.providerId.location;
  }
  return providerLocation || "Location not available";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ServiceCard({
  service,
  providerLocation,
}: ServiceCardProps) {
  const categoryName = getCategoryName(service);
  const location = getServiceLocation(service, providerLocation);

  return (
    <article className="h-full flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {/* IMAGE CONTAINER (Matches Provider top gradient vibe when no image) */}
      <div className="h-44 sm:h-48 w-full overflow-hidden bg-gradient-to-r from-sky-50 via-white to-blue-50">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">
              {service.title}
            </p>
          </div>
        )}
      </div>

      {/* CONTENT (Uses p-6 to match ProviderCard) */}
      <div className="p-6 flex flex-col flex-1">
        <div className="min-w-0 flex-1">
          {/* META TAGS (Uses the ringed pill design from ProviderCard) */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500 max-w-full">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
              <Clock3 className="h-3.5 w-3.5 text-blue-600" />
              {service.duration} min
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
              <Tag className="h-3.5 w-3.5 text-emerald-600" />
              {formatCurrency(service.price)}
            </span>
          </div>

          {/* TITLE (Sized up to match ProviderCard h2) */}
          <h3 className="text-xl font-semibold text-slate-900 line-clamp-2 min-h-[3.5rem]">
            {service.title}
          </h3>

          {/* DESCRIPTION (Uses exact leading and line-clamp from ProviderCard) */}
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-sm leading-7 text-slate-600">
            {service.description || "Service details will be added soon."}
          </p>
        </div>

        {/* FOOTER (Uses exact border-t and spacing from ProviderCard) */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="flex items-center gap-1.5 text-sm text-slate-500 truncate pr-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
          </p>
          
          <Link
            href={Routes.SERVICE_DETAILS(service.id)}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
          >
            View details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}