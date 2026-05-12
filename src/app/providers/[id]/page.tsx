import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  MapPin,
  MessageSquareText,
  Star,
} from "lucide-react";

import { PAGINATION } from "@/constants/config";
import { Routes } from "@/constants/routes";
import { ApiError } from "@/lib/api-error";
import { getProviderById } from "@/services/provider.service";
import { getAllServices } from "@/services/service.service";
import ServiceCard from "@/components/services/ServiceCard";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProviderUser = {
  name?: string;
  email?: string;
  avatar?: string | null;
};

type ProviderDTO = {
  id: string;
  userId?: string | ProviderUser | null;
  businessName?: string;
  description?: string;
  location?: string;
  rating?: number;
  isVerified?: boolean;
  totalReviews?: number;
  avatar?: string | null;
};

type ServiceDTO = {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  categoryId?: { name?: string } | string | null;
  providerId?: { businessName?: string; location?: string } | string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isProviderUser(value: ProviderDTO["userId"]): value is ProviderUser {
  return typeof value === "object" && value !== null;
}

function getProviderName(provider: ProviderDTO) {
  if (isProviderUser(provider.userId) && provider.userId.name)
    return provider.userId.name;
  if (provider.businessName) return provider.businessName;
  return "Provider";
}

function getProviderAvatar(provider: ProviderDTO) {
  if (provider.avatar) return provider.avatar;
  if (isProviderUser(provider.userId) && provider.userId.avatar)
    return provider.userId.avatar;
  return null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProviderDetailsPage(
  props: PageProps<"/providers/[id]">
) {
  const { id } = await props.params;

  let provider: ProviderDTO;

  try {
    provider = (await getProviderById(id)) as ProviderDTO;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  const { services } = (await getAllServices(1, PAGINATION.MAX_LIMIT, {
    providerId: id,
  })) as { services: ServiceDTO[] };

  const providerName    = getProviderName(provider);
  const providerAvatar  = getProviderAvatar(provider);
  const providerInitial = providerName.charAt(0).toUpperCase() || "P";
  const serviceCount    = services.length;
  const minPrice        = serviceCount > 0
    ? Math.min(...services.map((s) => s.price))
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

        {/* Back link */}
        <Link
          href={Routes.PROVIDERS}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All providers
        </Link>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_340px]">

          {/* ── Left column ── */}
          <div className="space-y-6 min-w-0">

            {/* Provider hero card */}
            <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Gradient header */}
              <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 px-7 py-8 border-b border-slate-100">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                  {/* Avatar + name */}
                  <div className="flex items-start gap-5 min-w-0">
                    {providerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={providerAvatar}
                        alt={providerName}
                        className="h-20 w-20 rounded-[22px] object-cover shadow-sm flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[22px] bg-blue-600 text-2xl font-semibold text-white shadow-sm">
                        {providerInitial}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl truncate">
                          {providerName}
                        </h1>
                        {provider.isVerified && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 flex-shrink-0">
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">
                          <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-600" />
                          {provider.businessName || "Independent Provider"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" />
                          {provider.location || "Location not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stat pills */}
                  <div className="flex gap-3 flex-shrink-0">
                    <div className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-slate-200 text-center min-w-[80px]">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        Services
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {serviceCount}
                      </p>
                    </div>
                    <div className="rounded-[18px] bg-blue-600 px-4 py-3 text-white text-center min-w-[80px] shadow-sm shadow-blue-200">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-100">
                        Rating
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-2xl font-semibold">
                        <Star className="h-4 w-4 fill-current" />
                        {provider.rating?.toFixed(1) || "New"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-7 py-7">
                <div className="grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_200px]">

                  {/* About + summary pills */}
                  <div className="space-y-5">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                        About
                      </p>
                      <p className="text-sm leading-7 text-slate-600">
                        {provider.description ||
                          `${providerName} offers professional services${
                            provider.location ? ` in ${provider.location}` : ""
                          }.`}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Company
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {provider.businessName || "Independent Provider"}
                        </p>
                      </div>
                      <div className="rounded-[18px] bg-slate-50 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          Reviews
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                          {provider.totalReviews || 0} total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile summary sidebar */}
                  <div className="rounded-[18px] bg-slate-50 p-4 space-y-4 h-fit">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Summary
                    </p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Name</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {providerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          {provider.location || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Availability</p>
                        <p className="font-semibold text-slate-900 mt-0.5">
                          See services below
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services section */}
            <section
              id="provider-services"
              className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                    Services
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    By {providerName}
                  </h2>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {serviceCount === 0
                    ? "None published yet"
                    : `${serviceCount} available`}
                </p>
              </div>

              {serviceCount === 0 ? (
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                  <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-900">
                    No services yet
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">
                    This provider hasn't published any services yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={{
                        ...service,
                        _id: service.id,
                        categoryId:
                          typeof service.categoryId === "object"
                            ? service.categoryId
                            : null,
                        providerId:
                          typeof service.providerId === "object"
                            ? service.providerId
                            : null,
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5 h-fit xl:sticky xl:top-8">

            {/* Provider card */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Provider
              </p>
              <div className="flex items-center gap-4 mb-5">
                {providerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={providerAvatar}
                    alt={providerName}
                    className="h-14 w-14 rounded-[16px] object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[16px] bg-blue-600 text-xl font-semibold text-white">
                    {providerInitial}
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-900 truncate">
                    {providerName}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {provider.businessName || "Independent Provider"}
                  </p>
                </div>
              </div>

              <p className="text-xs leading-6 text-slate-500 mb-5">
                {provider.description ||
                  `${providerName} helps customers discover and book trusted services.`}
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href={Routes.PROVIDERS}
                  className="flex-1 inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  All providers
                </Link>
                <a
                  href="#provider-services"
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                >
                  See services
                </a>
              </div>
            </section>

            {/* Quick details */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                Quick details
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-amber-50 p-2.5 flex-shrink-0">
                    <MapPin className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {provider.location || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-sky-50 p-2.5 flex-shrink-0">
                    <MessageSquareText className="h-4 w-4 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Description</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {provider.description ? "Available" : "Not added yet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2.5 flex-shrink-0">
                    <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Starting from</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {minPrice !== null ? formatCurrency(minPrice) : "No pricing yet"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-violet-50 p-2.5 flex-shrink-0">
                    <Star className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Rating</p>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {provider.rating
                        ? `${provider.rating.toFixed(1)} · ${provider.totalReviews || 0} reviews`
                        : "No reviews yet"}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={
                  serviceCount > 0
                    ? Routes.SERVICE_DETAILS(services[0].id)
                    : "#"
                }
                className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                  serviceCount > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
                aria-disabled={serviceCount === 0}
                tabIndex={serviceCount === 0 ? -1 : undefined}
              >
                View first service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}