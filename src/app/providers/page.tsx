import { BriefcaseBusiness, MapPin, Search, ShieldCheck, ChevronRight } from "lucide-react";
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
      <div className="flex justify-center items-center py-20">
        <p className="text-red-500 text-sm font-medium">
          Failed to load providers. Please try again later.
        </p>
      </div>
    );
  }

  if (!providers) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-slate-400 text-sm">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Hero Banner ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-1/3 w-40 h-40 rounded-full bg-indigo-300/15 blur-2xl" />

          <div className="relative">
            {/* Tag */}
            <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
              <Search className="w-3 h-3" />
              Find Providers
            </span>

            <h1 className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
                style={{ fontFamily: "'DM Serif Display', serif" }}>
              Browse Trusted Providers
            </h1>

            <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-xl mb-6">
              Open any provider profile to view their company info, description,
              location, and full list of services.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <BriefcaseBusiness className="w-4 h-4 text-blue-500" />
                {providers.length} Provider{providers.length !== 1 ? "s" : ""}
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {providers.length}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <MapPin className="w-4 h-4 text-amber-500" />
                Public profiles enabled
              </span>
              <span className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 rounded-full px-4 py-2 text-sm font-medium text-[#1e3a5f]">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Verified providers
              </span>
            </div>
          </div>
        </section>

        {/* ── Empty State ── */}
        {providers.length === 0 ? (
          <section className="bg-white border-[1.5px] border-dashed border-blue-200 rounded-3xl px-6 py-16 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <BriefcaseBusiness className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">No providers found</h2>
            <p className="text-sm text-[#6b93c4] leading-relaxed max-w-sm mx-auto">
              There are no provider profiles yet. Once a provider is created, it will appear here automatically.
            </p>
          </section>

        ) : (
          /* ── Providers Grid ── */
          <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </section>
        )}

      </div>
    </div>
  );
}