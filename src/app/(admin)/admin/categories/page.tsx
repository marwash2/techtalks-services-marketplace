"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FolderOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type CategoryRow = {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  createdAt?: string | Date;
};

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryRow[]>(
    [],
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [imageLoadErrors, setImageLoadErrors] = useState<
    Record<string, boolean>
  >({});
  const [previewImageError, setPreviewImageError] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [slug, setSlug] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ✅ AUTO HIDE MESSAGE (NEW)
  function showMessage(type: "success" | "error", text: string) {
    setFormMessage({ type, text });

    setTimeout(() => {
      setFormMessage(null);
    }, 5000);
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      const data = await res.json();

      const list = data.data?.categories || [];

      setCategories(list);
      setFilteredCategories(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter((c) => {
      const matchSearch = `${c.name || ""}${c.slug || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (c.isActive ?? true)) ||
        (statusFilter === "inactive" && !(c.isActive ?? true));
      return matchSearch && matchStatus;
    });
    setFilteredCategories(filtered);
  }, [search, categories, statusFilter]);

  function handleNameChange(value: string) {
    setName(value);

    if (!editingId) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }

  async function handleSubmit() {
    setFormMessage(null);

    if (!name.trim()) {
      showMessage("error", "Name is required.");
      return;
    }
    if (!icon.trim()) {
      showMessage("error", "Image URL is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        description,
        icon,
        slug,
      };

      let res: Response;

      if (editingId) {
        res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();

      if (!res.ok) {
        showMessage(
          "error",
          json?.error ||
            (editingId
              ? "Failed to update category."
              : "Failed to create category."),
        );
        return;
      }

      showMessage(
        "success",
        json?.message ||
          (editingId
            ? "Category updated successfully."
            : "Category added successfully."),
      );

      resetForm();
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      showMessage("error", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: CategoryRow) {
    setFormMessage(null);
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "");
    setSlug(category.slug || "");
    setPreviewImageError(false);
    setEditingId(category._id || category.id || null);
    setIsModalOpen(true);
  }

  async function deleteCategory(id: string) {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        showMessage("error", json?.error || "Delete failed.");
        return;
      }

      if (editingId === id) resetForm();
      setDeleteId(null);

      showMessage("success", "Category deleted successfully.");
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleCategoryVisibility(category: CategoryRow) {
    const rowId = category._id || category.id;
    if (!rowId) return;

    const nextIsActive = !(category.isActive ?? true);

    const applyStatus = (list: CategoryRow[]) =>
      list.map((item) => {
        const itemId = item._id || item.id;
        return itemId === rowId ? { ...item, isActive: nextIsActive } : item;
      });

    setCategories((prev) => applyStatus(prev));
    setFilteredCategories((prev) => applyStatus(prev));

    try {
      const res = await fetch(`/api/categories/${rowId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextIsActive }),
      });

      const json = await res.json();

      if (!res.ok) {
        showMessage(
          "error",
          json?.error || "Failed to update category status.",
        );
        return;
      }

      showMessage(
        "success",
        nextIsActive ? "Category is now active." : "Category is now inactive.",
      );
    } catch (err) {
      console.error(err);
      showMessage("error", "Failed to update category status.");
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("");
    setSlug("");
    setPreviewImageError(false);
    setEditingId(null);
  }

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive ?? true).length;
  const inactiveCategories = categories.filter(
    (c) => !(c.isActive ?? true),
  ).length;
  const subCategories = categories.filter((c) => !!c.parentId).length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        Loading categories...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage all category records for your marketplace.
          </p>
        </div>
        <button
          onClick={() => {
            setFormMessage(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={17} />
          Add Category
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Click{" "}
          <span className="font-semibold text-slate-800">Add Category</span> to
          create a new category, or use the edit icon in table rows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Categories"
          value={totalCategories}
          tint="indigo"
          icon={<FolderOpen size={20} />}
        />
        <StatCard
          title="Active Categories"
          value={activeCategories}
          tint="green"
          icon={<Eye size={20} />}
        />
        <StatCard
          title="Inactive Categories"
          value={inactiveCategories}
          tint="amber"
          icon={<EyeOff size={20} />}
        />
        <StatCard
          title="Subcategories"
          value={subCategories}
          tint="rose"
          icon={<FolderOpen size={20} />}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        {!isModalOpen && formMessage && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              formMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {formMessage.type === "success" ? (
                <CheckCircle2 size={17} />
              ) : (
                <XCircle size={17} />
              )}
              <span>{formMessage.text}</span>
            </div>
          </div>
        )}
        <br />
        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm text-slate-700 outline-none ring-indigo-200 transition focus:ring"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 md:justify-self-end md:w-80">
            <Search size={18} />
            <input
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Category Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.map((c, index) => {
                const rowId = c._id || c.id || `row-${index}`;
                const rowImage = c.icon || "/noimage.jpeg";
                const hasImageError = imageLoadErrors[rowId];
                const isActiveRow = c.isActive ?? true;
                return (
                  <tr
                    key={rowId}
                    className="border-b border-slate-100 text-sm text-slate-700"
                  >
                    <td className="px-4 py-4">{index + 1}</td>
                    <td className="px-4 py-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                        <img
                          src={hasImageError ? "/noimage.jpeg" : rowImage}
                          alt={c.name || "category"}
                          className="h-full w-full object-cover"
                          onError={() =>
                            setImageLoadErrors((prev) => ({
                              ...prev,
                              [rowId]: true,
                            }))
                          }
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {c.slug || "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isActiveRow
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {isActiveRow ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(c)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => toggleCategoryVisibility(c)}
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
                            isActiveRow
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          title={
                            isActiveRow ? "Hide category" : "Unhide category"
                          }
                        >
                          {isActiveRow ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteId(rowId)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          Showing {filteredCategories.length} of {categories.length} entries
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (!saving) resetForm();
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {formMessage && (
                <div
                  className={`md:col-span-2 rounded-xl border p-3 text-sm ${
                    formMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formMessage.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    <span>{formMessage.text}</span>
                  </div>
                </div>
              )}
              <input
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none ring-indigo-200 focus:ring"
                placeholder="Name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <input
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none ring-indigo-200 focus:ring"
                placeholder="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <input
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none ring-indigo-200 focus:ring md:col-span-2"
                placeholder="Image URL (required)"
                value={icon}
                onChange={(e) => {
                  setIcon(e.target.value);
                  setPreviewImageError(false);
                }}
              />
              <div className="md:col-span-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Image Preview
                </p>
                <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    src={
                      previewImageError
                        ? "/noimage.jpeg"
                        : icon.trim() || "/noimage.jpeg"
                    }
                    alt="Category preview"
                    className="h-full w-full object-cover"
                    onError={() => setPreviewImageError(true)}
                  />
                </div>
              </div>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-indigo-200 focus:ring md:col-span-2"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-5">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (!saving) resetForm();
                }}
                className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-2xl">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
                🗑️
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-3 text-2xl font-bold text-gray-800">
              Delete Category
            </h2>

            {/* Description */}
            <p className="mb-6 leading-relaxed text-gray-600">
              Are you sure you want to permanently delete this category?
              <br />
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {/* Cancel */}
              <button
                onClick={() => setDeleteId(null)}
                className="cursor-pointer rounded-xl border border-gray-300 px-5 py-3 text-gray-700 transition hover:bg-gray-100"
              >
                Keep Category
              </button>

              {/* Confirm */}
              <button
                onClick={() => deleteCategory(deleteId)}
                className="cursor-pointer rounded-xl bg-red-600 px-5 py-3 text-white transition hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  tint,
  icon,
}: {
  title: string;
  value: number;
  tint: "indigo" | "green" | "amber" | "rose";
  icon: JSX.Element;
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-full p-3 ${tones[tint]}`}>{icon}</div>
      </div>
    </div>
  );
}
