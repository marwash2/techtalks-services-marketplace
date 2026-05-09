import Link from "next/link";
import {
  MapPin,
  BriefcaseBusiness,
  Star,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

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

const gradients = [
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-pink-500",
  "from-emerald-500 to-blue-500",
  "from-amber-500 to-red-500",
  "from-pink-500 to-violet-500",
  "from-sky-500 to-emerald-500",
];

export default function ProviderCard({
  provider,
}: {
  provider: ProviderDTO;
}) {
  const initial =
    provider.businessName?.[0]?.toUpperCase() ??
    "P";

  const gradient =
    gradients[
      provider.id.charCodeAt(0) %
        gradients.length
    ];

  const ownerName =
    typeof provider.userId === "object" &&
    provider.userId !== null
      ? provider.userId.name
      : null;

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group block h-full"
    >
      <div className="h-full bg-white border border-blue-100 rounded-[24px] p-4 flex flex-col gap-3 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(37,99,235,0.10)] hover:border-blue-300 hover:-translate-y-1 relative overflow-hidden">

        {/* TOP HOVER BAR */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-[24px]" />

        {/* TOP SECTION */}
        <div className="flex items-start justify-between gap-3">

          {/* LEFT SIDE */}
          <div className="flex items-center gap-3 min-w-0">

            {/* IMAGE / INITIAL */}
            {provider.avatar ? (
              <div className="w-16 h-16 rounded-[18px] overflow-hidden border border-blue-100 shadow-sm flex-shrink-0">
                <img
                  src={provider.avatar}
                  alt={
                    provider.businessName ||
                    "Provider"
                  }
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`w-16 h-16 rounded-[18px] bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0`}
              >
                {initial}
              </div>
            )}

            {/* NAME + OWNER */}
            <div className="min-w-0">

              <h3 className="text-[17px] font-bold text-[#1e3a5f] leading-tight truncate">
                {provider.businessName ||
                  "Unnamed Provider"}
              </h3>

              {ownerName && (
                <p className="text-xs text-[#7c9bc0] mt-1 truncate">
                  {ownerName}
                </p>
              )}

            </div>
          </div>

          {/* VERIFIED BADGE */}
          {provider.isVerified ? (
            <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0">
              Pending
            </span>
          )}
        </div>

        {/* DESCRIPTION */}
        {provider.description && (
          <p className="text-sm text-[#6b93c4] leading-relaxed line-clamp-2">
            {provider.description}
          </p>
        )}

        {/* META */}
        <div className="flex flex-col gap-1.5">

          {provider.location && (
            <div className="flex items-center gap-2 text-xs text-[#4b6fa8]">
              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />

              <span className="truncate">
                {provider.location}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-[#4b6fa8]">
            <BriefcaseBusiness className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            Service Provider
          </div>

        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between pt-3 border-t border-blue-50 mt-auto">

          {/* RATING */}
          <div className="flex items-center gap-1">

            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />

            <span className="text-sm font-bold text-[#1e3a5f]">
              {provider.rating?.toFixed(1) ??
                "—"}
            </span>

            {provider.totalReviews !==
              undefined && (
              <span className="text-xs text-[#9db7d8]">
                ({provider.totalReviews})
              </span>
            )}

          </div>

          {/* BUTTON */}
          <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-xl group-hover:bg-blue-100 transition-colors">
            View
            <ChevronRight className="w-3.5 h-3.5" />
          </span>

        </div>
      </div>
    </Link>
  );
}