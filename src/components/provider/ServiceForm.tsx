"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  _id?: string;
  id?: string;
  name: string;
};

type ServiceFormProps = {
  mode: "create" | "edit";
  serviceId?: string;
};

export default function ServiceForm({
  mode,
  serviceId,
}: ServiceFormProps) {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(false);

  /* ---------------- FORM STATE ---------------- */
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    price: "",
    duration: "",
    availability: "",
    location: "",
    image: "",
  });

  /* ---------------- FETCH CATEGORIES ---------------- */
  useEffect(() => {
    const fetchCategories =
      async () => {
        try {
          const res =
            await fetch(
              "/api/categories",
              {
                credentials:
                  "include",
              }
            );

          if (!res.ok) {
            throw new Error(
              "Failed to fetch categories"
            );
          }

          const data =
            await res.json();

          console.log(
            "Fetched categories:",
            data
          );

          setCategories(
            data.data
              ?.categories || []
          );
        } catch (err) {
          console.error(
            "Failed to fetch categories:",
            err
          );
        }
      };

    fetchCategories();
  }, []);

  /* ---------------- FETCH SERVICE FOR EDIT ---------------- */
  useEffect(() => {
    if (
      mode !== "edit" ||
      !serviceId
    ) {
      return;
    }

    const fetchService =
      async () => {
        try {
          setLoading(true);

          console.log(
            "Fetching service ID:",
            serviceId
          );

          const res =
            await fetch(
              `/api/services/${serviceId}`,
              {
                credentials:
                  "include",
              }
            );

          if (!res.ok) {
            let errorMessage =
              "Failed to fetch service";

            try {
              const errorData =
                await res.json();

              console.error(
                "Fetch service error:",
                errorData
              );

              errorMessage =
                errorData.error ||
                errorData.message ||
                errorMessage;
            } catch {
              console.error(
                "Could not parse fetch error"
              );
            }

            throw new Error(
              errorMessage
            );
          }

          const data =
            await res.json();

          console.log(
            "Fetched service:",
            data
          );

          const service =
            data.data?.service;

          if (!service) {
            throw new Error(
              "Service not found"
            );
          }

          /* ---------------- PREFILL FORM ---------------- */
          setForm({
            title:
              service.title ||
              "",

            description:
              service.description ||
              "",

            categoryId:
              service.category?._id ||
              service.category?.id ||
              service.categoryId?._id ||
              service.categoryId?.id ||
              service.categoryId ||
              "",

            price: String(
              service.price || ""
            ),

            duration: String(
              service.duration ||
                ""
            ),

            availability:
              service.availability ||
              "",

            location:
              service.location ||
              "",

            image:
              service.image ||
              "",
          });
        } catch (err) {
          console.error(
            "Edit fetch error:",
            err
          );

          alert(
            err instanceof Error
              ? err.message
              : "Failed to load service details"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchService();
  }, [mode, serviceId]);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...form,

        categoryId:
          form.categoryId,

        image:
          form.image.trim()
            ? form.image
            : null,

        price: Number(
          form.price
        ),

        duration: Number(
          form.duration
        ),

        availability:
          form.availability.trim(),

        location:
          form.location.trim(),
      };

      console.log(
        "Submitting payload:",
        payload
      );

      const endpoint =
        mode === "create"
          ? "/api/services"
          : `/api/services/${serviceId}`;

      const method =
        mode === "create"
          ? "POST"
          : "PUT";

      console.log(
        "Submitting to:",
        endpoint
      );

      const res =
        await fetch(
          endpoint,
          {
            method,

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        );

      if (!res.ok) {
        let errorMessage =
          "Failed to save service";

        try {
          const errorData =
            await res.json();

          console.error(
            "Save error:",
            errorData
          );

          errorMessage =
            errorData.error ||
            errorData.message ||
            errorMessage;
        } catch {
          console.error(
            "Could not parse backend error response"
          );
        }

        throw new Error(
          errorMessage
        );
      }

      const result =
        await res.json();

      console.log(
        "Service saved successfully:",
        result
      );

      router.push(
        "/provider/services"
      );
    } catch (err) {
      console.error(
        "Submit error:",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow border">
      <h1 className="text-3xl font-bold mb-6">
        {mode === "create"
          ? "Add New Service"
          : "Edit Service"}
      </h1>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-5"
      >
        {/* TITLE */}
        <input
          type="text"
          placeholder="Service Title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        {/* DESCRIPTION */}
        <textarea
          placeholder="Description"
          value={
            form.description
          }
          onChange={(e) =>
            setForm({
              ...form,
              description:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
        />

        {/* CATEGORY */}
        <select
          value={
            form.categoryId
          }
          onChange={(e) =>
            setForm({
              ...form,
              categoryId:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        >
          <option value="">
            Select Category
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category._id ||
                  category.id
                }
                value={
                  category._id ||
                  category.id
                }
              >
                {
                  category.name
                }
              </option>
            )
          )}
        </select>

        {/* PRICE */}
        <input
          type="number"
          placeholder="Price"
          value={
            form.price
          }
          onChange={(e) =>
            setForm({
              ...form,
              price:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        {/* DURATION */}
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={
            form.duration
          }
          onChange={(e) =>
            setForm({
              ...form,
              duration:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        {/* AVAILABILITY */}
        <input
          type="text"
          placeholder="Availability (e.g. Mon-Fri 9AM-5PM)"
          value={
            form.availability
          }
          onChange={(e) =>
            setForm({
              ...form,
              availability:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        {/* LOCATION */}
        <input
          type="text"
          placeholder="Location (e.g. Beirut, Lebanon)"
          value={
            form.location
          }
          onChange={(e) =>
            setForm({
              ...form,
              location:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
        />

        {/* IMAGE */}
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={
            form.image
          }
          onChange={(e) =>
            setForm({
              ...form,
              image:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
        />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={
            loading
          }
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading
            ? "Saving..."
            : mode ===
              "create"
            ? "Add Service"
            : "Update Service"}
        </button>
      </form>
    </div>
  );
}