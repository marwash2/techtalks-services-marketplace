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
<article
      className="
        group 
        flex 
        h-full 
        flex-col 
        overflow-hidden 
        rounded-2xl 
        border 
        border-slate-200 
        bg-white 
        shadow-sm 
        transition 
        hover:shadow-lg
      "
    >
      {/* IMAGE (FIXED HEIGHT) */}
      <div className="h-44 sm:h-48 w-full overflow-hidden bg-slate-100">
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 px-4 text-center">
            <p className="text-sm font-semibold text-slate-900 line-clamp-2">
              {service.title}
            </p>
          </div>
        )}
      </div>

      {/* CONTENT (FORCED EQUAL SPACING) */}
      <div className="flex flex-1 flex-col p-5">
        {/* TITLE */}
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 min-h-[48px]">
          {service.title}
        </h3>

        {/* DESCRIPTION (FIXED SPACE) */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2 min-h-[40px]">
          {service.description || "Service details will be added soon."}
        </p>

        {/* PUSH BOTTOM CONTENT DOWN */}
        <div className="mt-auto space-y-3 pt-4">
          {/* META */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              {service.duration} min
            </span>

            <span className="font-medium text-slate-700">
              {formatCurrency(service.price)}
            </span>
          </div>

          {/* LINK (ALWAYS SAME POSITION) */}
          <Link
            href={Routes.SERVICE_DETAILS(service.id)}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-100"
          >
            View details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>

  );
}
