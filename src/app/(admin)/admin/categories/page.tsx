"use client";

import { useEffect, useState } from "react";

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [slug, setSlug] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  
  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
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

  // Search
  useEffect(() => {
    const filtered = categories.filter((c) =>
      (c.name + c.slug)
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [search, categories]);

  //  slug
  function handleNameChange(value: string) {
    setName(value);

    if (!editingId) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      );
    }
  }

  // submit
  async function handleSubmit() {
    if (!name.trim()) {
      alert("Name is required");
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

      if (!res.ok) {
        alert(editingId ? "Failed to update" : "Failed to create");
        return;
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // edit
  function handleEdit(category: any) {
    setName(category.name);
    setDescription(category.description || "");
    setIcon(category.icon || "");
    setSlug(category.slug || "");
    setEditingId(category._id || category.id);
  }

  // delete
  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      if (editingId === id) resetForm();

      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("");
    setSlug("");
    setEditingId(null);
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">

      {/* header */}
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>

      {/* form */}
      <div className="border p-4 mb-6 bg-gray-50 rounded">

        <h2 className="font-semibold mb-3">
          {editingId ? "Edit Category" : "Add Category"}
        </h2>

        <div className="grid gap-2">

          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          />

          <textarea
            className="border p-2 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>

        </div>
      </div>

      {/* search */}
      <input
        className="border p-2 w-full rounded mb-4"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Slug</th>
            <th>Icon</th>
            <th>Description</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredCategories.map((c) => (
            <tr key={c.id} className="border-t">
              <td>{c.name}</td>
              <td>{c.slug}</td>
              <td>{c.icon || "-"}</td>
              <td>{c.description || "-"}</td>
              <td>
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString()
                  : "-"}
              </td>

              <td>
                <button
                  onClick={() => handleEdit(c)}
                  className="text-blue-600 mr-3"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteCategory(c.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}