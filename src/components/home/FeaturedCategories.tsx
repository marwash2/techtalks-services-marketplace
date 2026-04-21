"use client";

import { useEffect, useState } from "react";

interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories?page=1&limit=3");
        const json = await res.json();
        console.log(json); 
        setCategories(json.data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) return <p className="text-center py-6">Loading categories...</p>;
  if (categories.length === 0) return <p className="text-center py-6 text-gray-600">No categories available yet</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <div key={cat.id} className="p-6 border rounded shadow hover:shadow-lg">
          <h3 className="font-bold">{cat.name}</h3>
          <p className="text-sm text-gray-600">
            {cat.description || `Explore top services in ${cat.name}.`}
          </p>
        </div>
      ))}
    </div>
  );
}
