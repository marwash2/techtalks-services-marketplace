"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface CategoryDTO {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories?page=1&limit=6");
        const json = await res.json();
        console.log(json);
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

  return (
    <div className="bg-gray-50 py-6 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 shadow-gray-200 shadow-md">
      {categories.map((category) => (
        <Link
          key={category._id || category.id}
          href={`/services/category/${category.slug}`}
          className="group block p-5 border border-slate-200 rounded-2xl flex flex-col item center text center hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white"
        >
          <div className="w-14 h-14 bg-blue-50  text-blue-600  rounded-xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className=" font-semibold text-lg">
              {category.name.charAt(0)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800  group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-slate-500 mt-1 leading-relaxed line-clamp-2">
            {category.description ||
              `Discover top rated ${category.name.toLowerCase()} services near you.`}
          </p>
        </Link>
      ))}
    </div>
  );
}
