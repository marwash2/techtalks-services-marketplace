import Link from "next/link";
import { notFound } from "next/navigation";
import {
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

function isProviderUser(value: ProviderDTO["userId"]): value is ProviderUser {
  return typeof value === "object" && value !== null;
}

function getProviderName(provider: ProviderDTO) {
  if (isProviderUser(provider.userId) && provider.userId.name) {
    return provider.userId.name;
  }

  if (provider.businessName) {
    return provider.businessName;
  }

  return "Provider";
}

function getProviderAvatar(provider: ProviderDTO) {
  if (provider.avatar) {
    return provider.avatar;
  }

  if (isProviderUser(provider.userId) && provider.userId.avatar) {
    return provider.userId.avatar;
  }

  return null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function ProviderDetailsPage(
  props: PageProps<"/providers/[id]">,
) {
  const { id } = await props.params;

  let provider: ProviderDTO;

  try {
    provider = (await getProviderById(id)) as ProviderDTO;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }

  const { services } = (await getAllServices(1, PAGINATION.MAX_LIMIT, {
    providerId: id,
  })) as { services: ServiceDTO[] };

  const providerName = getProviderName(provider);
  const providerAvatar = getProviderAvatar(provider);
  const providerInitial = providerName.charAt(0).toUpperCase() || "P";
  const serviceCount = services.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <div className="space-y-8 min-w-0">
          <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-6 py-8 sm:px-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4 min-w-0">
                  {providerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={providerAvatar}
                      alt={providerName}
                      className="h-24 w-24 rounded-[28px] object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-600 text-3xl font-semibold text-white shadow-sm">
                      {providerInitial}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                        {providerName}
                      </h1>
                      {provider.isVerified ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                        <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
                        {provider.businessName || "Independent Provider"}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        {provider.location || "Location not available"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="rounded-2xl bg-white px-4 py-3 text-slate-700 ring-1 ring-slate-200">
                    <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">
                      Services
                    </span>
                    <span className="mt-1 block text-2xl font-semibold text-slate-900">
                      {serviceCount}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-sm">
                    <span className="block text-xs uppercase tracking-[0.2em] text-blue-100">
                      Rating
                    </span>
                    <span className="mt-1 inline-flex items-center gap-2 text-2xl font-semibold">
                      <Star className="h-5 w-5 fill-current" />
                      {provider.rating?.toFixed(1) || "New"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 sm:px-8">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_220px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                      About Provider
                    </p>
                    <p className="mt-4 text-base leading-8 text-slate-600">
                      {provider.description ||
                        `${providerName} offers professional services${
                          provider.location ? ` in ${provider.location}` : ""
                        }.`}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Company
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {provider.businessName || "Independent Provider"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        Reviews
                      </p>
                      <p className="mt-3 text-lg font-semibold text-slate-900">
                        {provider.totalReviews || 0} total reviews
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Profile Summary
                  </p>
                  <dl className="mt-4 space-y-4 text-sm text-slate-600">
                    <div>
                      <dt className="font-medium text-slate-500">
                        Provider Name
                      </dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {providerName}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Location</dt>
                      <dd className="mt-1">
                        {provider.location || "Not provided"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">
                        Availability
                      </dt>
                      <dd className="mt-1">Browse active services below</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>

          <section
            id="provider-services"
            className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                  Services By This Provider
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  Services by {providerName}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {serviceCount === 0
                  ? "No services published yet"
                  : `${serviceCount} service${serviceCount === 1 ? "" : "s"} available`}
              </p>
            </div>

            {serviceCount === 0 ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  No services available right now
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  This provider profile exists, but there are no active services
                  to display yet.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    providerLocation={provider.location}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Provider Header
            </p>
            <div className="mt-5 flex items-center gap-4">
              {providerAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={providerAvatar}
                  alt={providerName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-semibold text-white">
                  {providerInitial}
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Provided by
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {providerName}
                </h2>
                <p className="text-sm text-slate-500">
                  {provider.businessName || "Independent Provider"}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-600">
              {provider.description ||
                `${providerName} helps customers discover and book trusted services.`}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={Routes.PROVIDERS}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Browse Providers
              </Link>
              <a
                href="#provider-services"
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                See Services
              </a>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Quick Details
            </p>
            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {provider.location || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Description
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {provider.description ? "Available" : "Not added yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Starting From
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {serviceCount > 0
                      ? formatCurrency(
                          Math.min(...services.map((service) => service.price)),
                        )
                      : "No pricing yet"}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={
                serviceCount > 0 ? Routes.SERVICE_DETAILS(services[0].id) : "#"
              }
              className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${
                serviceCount > 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
              aria-disabled={serviceCount === 0}
              tabIndex={serviceCount === 0 ? -1 : undefined}
            >
              View Service Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
