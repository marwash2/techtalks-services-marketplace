import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, Tag } from "lucide-react";

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
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const categoryName = service.categoryId?.name || "Service";

  const location = service.providerId?.location || "Location not available";

  return (
    <article
      className="
       group flex flex-col  rounded-2xl border border-gray-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full"
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
          <div className="w-full bg-gray-100 h-full flex items-center justify-center text-muted-foreground">
            <span className=" text-sm font-semibold text-gray-400 line-clamp-2">
              No Image
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="text-xs font-semibold text-blue-500  tracking-wider ">
            {categoryName}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="min-w-0 flex-1">
          {/* 🆕 AIRBNB-STYLE BADGES */}
          {/* TITLE */}
          <h3 className="text-md font-semibold text-slate-900 loading-snug line-clamp-2 min-h-[3rem]">
            {service.title}
          </h3>

          {/* DESCRIPTION */}
          <p className="mt-2 line-clamp-3 min-h-[3.5rem] text-sm leading-relaxed text-slate-500">
            {service.description || "Service details will be added soon."}
          </p>
          <div className="mt-auto pt-6 bg-gray-100 shadow-md shadow-gray-200 px-4 rounded-2xl flex items-center justify-between">
            {/* META (price + duration unchanged style) */}
            <div className="mb-3 flex flex-wrap gap-2 text-sm text-slate-500 max-w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-1 py-1 rounded-full text-sm text-slate-600 ">
                <Clock3 className="h-4 w-4 text-blue-600" />
                {service.duration} min
              </span>
            </div>
            <div className="text-right mb-3 flex flex-wrap gap-2 max-w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-1 py-1 rounded-full text-xl  font-semibold">
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
