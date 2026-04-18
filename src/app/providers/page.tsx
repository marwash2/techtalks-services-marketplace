import { BriefcaseBusiness, MapPin } from "lucide-react";

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
  const { providers } = (await getAllProviders(1, 100)) as {
    providers: ProviderDTO[];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 p-6 overflow-hidden">
          {" "}
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Find Providers
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Browse trusted providers
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            Open any provider profile to view their company info, description,
            location, and services.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
              <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
              {providers.length} provider{providers.length === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
              <MapPin className="h-4 w-4 text-amber-500" />
              Public profile pages enabled
            </span>
          </div>
        </div>
      </section>

      {providers.length === 0 ? (
        <section className="mt-8 rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">
            No providers found
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            There are no provider profiles in the database yet. Once a provider
            is created, it will appear here automatically.
          </p>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
          {providers.map((provider) => (
            <div key={provider.id} className="h-full">
              <div className="h-full flex flex-col">
                <ProviderCard provider={provider} />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
