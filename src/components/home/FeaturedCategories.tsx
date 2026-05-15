"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_ICON_MAP, inferCategoryIconKey } from "@/lib/category-icons";

interface CategoryDTO {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  icon: string;
  description?: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories?page=1&limit=1000");
        const json = await res.json();
        setCategories(json.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center py-6">Loading categories...</p>;
  if (categories.length === 0)
    return (
      <p className="text-center py-6 text-gray-600">
        No categories available yet
      </p>
    );

  const sliderItems = [...categories, ...categories];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4 md:p-6">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent md:w-24" />

      <div className="category-slider-track flex w-max gap-4">
      {sliderItems.map((category, index) => {
        const iconKey = inferCategoryIconKey(category.name, category.icon);
        const Icon = CATEGORY_ICON_MAP[iconKey] || CATEGORY_ICON_MAP.default;

        return (
        <Link
          key={`${category._id || category.id}-${index}`}
          href={`/services/category/${category.slug}`}
          className="group flex min-w-[170px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/70 hover:shadow-md md:min-w-[190px]"
        >
          {/* ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-blue-600 transition-transform group-hover:scale-110">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>

          {/* TEXT */}
          <h3 className="mt-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
            {category.name}
          </h3>
        </Link>
        );
      })}
      </div>

      <style jsx>{`
        .category-slider-track {
          animation: slide-rtl 28s linear infinite;
          will-change: transform;
        }
        .category-slider-track:hover {
          animation-play-state: paused;
        }
        @keyframes slide-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
