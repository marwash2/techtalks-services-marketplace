import { BriefcaseBusiness, MapPin, Star, BadgeCheck } from "lucide-react";
import ProviderCard from "@/components/providers/ProviderCard";
import { getAllProviders } from "@/services/provider.service";

type ProviderDTO = {
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

export default async function ProvidersPage() {
  let providers: ProviderDTO[] = [];

  try {
    const response = await getAllProviders(1, 100);
    providers = response.providers;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-[24px] border border-rose-200 bg-white px-8 py-10 text-center shadow-sm max-w-md w-full">
          <p className="text-sm font-semibold text-rose-600 mb-2">
            Failed to load
          </p>
          <p className="text-slate-500 text-sm">
            Could not load providers. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const verifiedCount = providers.filter((p) => p.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">

        {/* ── Hero banner ── */}
        <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 px-8 py-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-2">
              Marketplace
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Browse trusted providers
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Discover verified service professionals. Open any profile to view
              their services, location, and reviews.
            </p>

            {/* Stat pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-600" />
                {providers.length} provider{providers.length === 1 ? "" : "s"}
              </span>
              {verifiedCount > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                  {verifiedCount} verified
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                Multiple locations
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200 shadow-sm">
                <Star className="h-3.5 w-3.5 text-violet-500" />
                Rated &amp; reviewed
              </span>
            </div>
          </div>
        </section>

        {/* ── Grid or empty state ── */}
        {providers.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-slate-200 bg-white px-8 py-20 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <BriefcaseBusiness className="h-6 w-6 text-slate-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              No providers yet
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 max-w-sm mx-auto">
              Provider profiles will appear here once they complete onboarding.
            </p>
          </section>
        ) : (
          <section className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}