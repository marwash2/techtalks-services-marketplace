"use client";

import { useEffect, useState, type ElementType, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Check,
  CircleDollarSign,
  Eraser,
  Loader2,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";

type FiltersProps = {
  onClose?: () => void;
};

type FilterCategory = {
  id: string;
  name: string;
  slug?: string;
};

type FilterOptions = {
  categories: FilterCategory[];
  locations: string[];
};

const RATINGS = [
  { label: "5 only", value: "5" },
  { label: "4 & up", value: "4" },
  { label: "3 & up", value: "3" },
  { label: "2 & up", value: "2" },
  { label: "1 & up", value: "1" },
];

function SectionTitle({
  icon: Icon,
  title,
  count,
}: {
  icon: ElementType;
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
      </div>
      {typeof count === "number" && (
        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {count}
        </span>
      )}
    </div>
  );
}

function ListOption({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <span className="min-w-0 truncate">{children}</span>
      {active && <Check className="h-4 w-4 shrink-0" />}
    </button>
  );
}

export default function Filters({ onClose }: FiltersProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [options, setOptions] = useState<FilterOptions>({
    categories: [],
    locations: [],
  });
  const [loadingOptions, setLoadingOptions] = useState(true);

  const currentCategory = searchParams.get("category") ?? "";
  const currentLocation = searchParams.get("location") ?? "";
  const currentRating = searchParams.get("minRating") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  useEffect(() => {
    let mounted = true;

    async function fetchOptions() {
      try {
        setLoadingOptions(true);
        const res = await fetch("/api/filter-options", {
          cache: "no-store",
        });
        const data = await res.json();

        if (!mounted || !res.ok || data?.success === false) return;

        setOptions({
          categories: data.data?.categories || [],
          locations: data.data?.locations || [],
        });
      } catch {
        if (mounted) {
          setOptions({ categories: [], locations: [] });
        }
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    }

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(
      params.toString() ? `${pathname}?${params.toString()}` : pathname,
    );
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasActiveFilters =
    currentCategory || currentLocation || currentRating || currentMaxPrice;

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use real marketplace data to narrow your search.
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
            >
              <Eraser className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 scrollbar-hide">
        {loadingOptions ? (
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Loading filters...
          </div>
        ) : (
          <>
            <section>
              <SectionTitle
                icon={Sparkles}
                title="Categories"
                count={options.categories.length}
              />

              <div className="rounded-2xl border border-slate-100 bg-white p-2">
                <select
                  value={currentCategory}
                  onChange={(e) => updateParam("category", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  aria-label="Select category"
                >
                  <option value="">All categories</option>
                  {options.categories.length > 0 ? (
                    options.categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No categories found
                    </option>
                  )}
                </select>
              </div>
            </section>

            <section className="border-t border-slate-100 pt-5">
              <SectionTitle
                icon={MapPin}
                title="Locations"
                count={options.locations.length}
              />

              <div className="rounded-2xl border border-slate-100 bg-white p-2">
                <select
                  value={currentLocation}
                  onChange={(e) => updateParam("location", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  aria-label="Select location"
                >
                  <option value="">All locations</option>
                  {options.locations.length > 0 ? (
                    options.locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No locations found
                    </option>
                  )}
                </select>
              </div>
            </section>
          </>
        )}

        <section className="border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <SectionTitle icon={CircleDollarSign} title="Max Price" />
            <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              {currentMaxPrice ? `$${currentMaxPrice}` : "Any"}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={currentMaxPrice || "500"}
            onChange={(event) =>
              updateParam(
                "maxPrice",
                event.target.value === "500" ? "" : event.target.value,
              )
            }
            className="w-full accent-blue-600"
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </section>

        <section className="border-t border-slate-100 pt-5">
          <SectionTitle icon={Star} title="Minimum Rating" />
          <div className="space-y-1 rounded-2xl border border-slate-100 bg-white p-1">
            <ListOption
              active={!currentRating}
              onClick={() => updateParam("minRating", "")}
            >
              Any rating
            </ListOption>
            {RATINGS.map((rating) => (
              <ListOption
                key={rating.value}
                active={currentRating === rating.value}
                onClick={() => updateParam("minRating", rating.value)}
              >
                <span className="flex items-center gap-2">
                  <span className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Number(rating.value)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </span>
                  {rating.label}
                </span>
              </ListOption>
            ))}
          </div>
        </section>
      </div>

      {onClose && (
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Show Results
          </button>
        </div>
      )}
    </aside>
  );
}
