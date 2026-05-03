"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link
          key={category._id || category.id}
          href={`/services/category/${category.slug}`}
          className="group-block p-4 border border-gray-300 shadow-sm bg-white rounded-2xl flex flex-col justify-center item-center text-center hover:shadow-md hover:bg-blue-50 hover:-translate-y-1 transition-all duration-300 "
        >
          <div className=" text-blue-500 rounded-xl  flex items-center justify-center gap-2 group-hover:scale-110 transition-transform ">
            {category.icon ? (
              <Image
                src={`/${category.icon}`}
                alt={`${category.name}`}
                width={50}
                height={50}
                className="object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <span className="text-sm font-semibold text-blue-400 item-center">
                  {category.icon}
                </span>
              </div>
            )}

            <h3 className="text-sm font-semibold text-slate-800  group-hover:text-blue-600 transition-colors">
              {category.name}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
