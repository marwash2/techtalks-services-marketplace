"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminEditServicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    price: 0,
    duration: 30,
    availability: "",
    location: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const [serviceRes, categoriesRes] = await Promise.all([
          fetch(`/api/services/${params.id}`, { cache: "no-store" }),
          fetch("/api/categories?limit=200", { cache: "no-store" }),
        ]);
        const serviceData = await serviceRes.json();
        const categoryData = await categoriesRes.json();
        const service = serviceData?.data?.service;

        setCategories(categoryData?.data?.categories || []);
        setForm({
          categoryId: service?.category?._id || service?.categoryId?._id || "",
          title: service?.title || "",
          description: service?.description || "",
          price: Number(service?.price || 0),
          duration: Number(service?.duration || 30),
          availability: service?.availability || "",
          location: service?.location || "",
          image: service?.image || "",
          isActive: Boolean(service?.isActive ?? true),
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        image: form.image || null,
      };
      const res = await fetch(`/api/services/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update service");
      router.push(`/admin/services/${params.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update service");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading service...</div>;

  return (
    <div className="space-y-5 p-2 sm:p-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Service</h1>
        <p className="mt-1 text-sm text-slate-500">Update service details from admin panel.</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-700">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id || category._id} value={category.id || category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Price</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => setForm((p) => ({ ...p, duration: Number(e.target.value) }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Availability</label>
            <input
              value={form.availability}
              onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-700">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Image URL</label>
          <input
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
          />
          Active service
        </label>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

