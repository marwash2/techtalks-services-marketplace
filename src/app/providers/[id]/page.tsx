import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  ShieldCheck,
  Star,
  ChevronRight,
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

function getProviderName(provider: ProviderDTO): string {
  if (isProviderUser(provider.userId) && provider.userId.name) {
    return provider.userId.name;
  }
  if (provider.businessName) {
    return provider.businessName;
  }
  return "Provider";
}

function getProviderAvatar(provider: ProviderDTO): string | null {
  if (provider.avatar) {
    return provider.avatar;
  }
  if (isProviderUser(provider.userId) && provider.userId.avatar) {
    return provider.userId.avatar;
  }
  return null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getMinPrice(services: ServiceDTO[]): number | null {
  if (services.length === 0) return null;
  let min = services[0].price;
  for (const service of services) {
    if (service.price < min) {
      min = service.price;
    }
  }
  return min;
}

export default async function ProviderDetailsPage(
  props: PageProps<"/providers/[id]">
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

  const result = (await getAllServices(1, PAGINATION.MAX_LIMIT, {
    providerId: id,
  })) as { services: ServiceDTO[] };

  const services = result.services;
  const providerName = getProviderName(provider);
  const providerAvatar = getProviderAvatar(provider);
  const initial = providerName.charAt(0).toUpperCase() || "P";
  const serviceCount = services.length;
  const minPrice = getMinPrice(services);

  const ratingDisplay = provider.rating ? provider.rating.toFixed(1) : "New";
  const totalReviews = provider.totalReviews ?? 0;
  const locationDisplay = provider.location || "Not provided";
  const companyDisplay = provider.businessName || "Independent Provider";
  const descriptionDisplay =
    provider.description ||
    providerName + " offers professional services" +
      (provider.location ? " in " + provider.location : "") + ".";
  const minPriceDisplay = minPrice !== null ? formatCurrency(minPrice) : "No pricing yet";
  const verificationDisplay = provider.isVerified ? "Verified Provider" : "Not verified";
  const servicesAvailableText =
    serviceCount === 0
      ? "No services yet"
      : serviceCount === 1
      ? "1 service available"
      : serviceCount + " services available";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="text-blue-500 font-medium hover:underline">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={Routes.PROVIDERS} className="text-blue-500 font-medium hover:underline">
            Providers
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-500 truncate">{providerName}</span>
        </nav>

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative space-y-6">

            {/* Avatar + Name + Tags */}
            <div className="flex items-center gap-5 flex-wrap">
              {providerAvatar ? (
                <img
                  src={providerAvatar}
                  alt={providerName}
                  className="w-[72px] h-[72px] rounded-[20px] object-cover border-2 border-blue-200 flex-shrink-0"
                />
              ) : (
                <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-blue-200 flex-shrink-0">
                  {initial}
                </div>
              )}

              <div className="space-y-2.5">
                <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] leading-tight">
                  {providerName}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {provider.isVerified && (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Provider
                    </span>
                  )}
                  {provider.location && (
                    <span className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-[#1e3a5f] text-xs font-medium px-3 py-1 rounded-full">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {provider.location}
                    </span>
                  )}
                  {provider.businessName && (
                    <span className="inline-flex items-center gap-1.5 bg-white border border-blue-200 text-[#1e3a5f] text-xs font-medium px-3 py-1 rounded-full">
                      <BriefcaseBusiness className="w-3 h-3 text-blue-500" />
                      {provider.businessName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stat Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white border border-blue-200 rounded-2xl px-5 py-3 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Services
                </span>
                <span className="text-xl font-bold text-[#1e3a5f]">{serviceCount}</span>
              </div>

              <div className="bg-blue-600 border border-blue-500 rounded-2xl px-5 py-3 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
                  Rating
                </span>
                <span className="text-xl font-bold text-white">★ {ratingDisplay}</span>
              </div>

              <div className="bg-white border border-blue-200 rounded-2xl px-5 py-3 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Reviews
                </span>
                <span className="text-xl font-bold text-[#1e3a5f]">{totalReviews}</span>
              </div>

              {minPrice !== null && (
                <div className="bg-white border border-blue-200 rounded-2xl px-5 py-3 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Starting From
                  </span>
                  <span className="text-xl font-bold text-[#1e3a5f]">{minPriceDisplay}</span>
                </div>
              )}
            </div>

          </div>
        </section>

        
        {/* Main Layout */}
        <div className="grid gap-5 xl:grid-cols-[1fr_300px] items-start">

          {/* Left Column */}
          <div className="space-y-5">

            {/* About */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                About Provider
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {descriptionDisplay}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Company
                  </p>
                  <p className="text-sm font-bold text-slate-900">{companyDisplay}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Total Reviews
                  </p>
                  <p className="text-sm font-bold text-slate-900">{totalReviews} reviews</p>
                </div>
              </div>
            </section>

            {/* Services */}
            <section id="provider-services" className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-end justify-between mb-5 pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Available Services
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">
                    Services by {providerName}
                  </h2>
                </div>
                <span className="text-sm text-slate-400">{servicesAvailableText}</span>
              </div>

              {serviceCount === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BriefcaseBusiness className="w-5 h-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">No services yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    This provider has no active services to display right now.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

          {/* Sidebar */}
          <aside>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                Quick Details
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-[18px] h-[18px] text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Location</p>
                    <p className="text-sm font-bold text-slate-900">{locationDisplay}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-[18px] h-[18px] text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Verification</p>
                    <p className="text-sm font-bold text-slate-900">{verificationDisplay}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BriefcaseBusiness className="w-[18px] h-[18px] text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Starting From</p>
                    <p className="text-sm font-bold text-slate-900">{minPriceDisplay}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-[18px] h-[18px] text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Rating</p>
                    <p className="text-sm font-bold text-slate-900">
                      {provider.rating ? provider.rating.toFixed(1) + " / 5" : "No ratings yet"}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="#provider-services"
                className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl transition"
              >
                View Services
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href={Routes.PROVIDERS}
                className="mt-3 flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium py-3 rounded-xl border border-slate-200 transition"
              >
                Browse All Providers
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}