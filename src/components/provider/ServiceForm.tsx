"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  BriefcaseBusiness,
  Clock3,
  DollarSign,
  ImageIcon,
  Loader2,
  MapPin,
  Save,
  Tag,
  Text,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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

  const [toast, setToast] =
    useState<{
      type: "success" | "error";
      message: string;
    } | null>(null);

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

  /* FETCH CATEGORIES */
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

          const data =
            await res.json();

          setCategories(
            data.data
              ?.categories || []
          );
        } catch (err) {
          console.error(err);
        }
      };

    fetchCategories();
  }, []);

  /* FETCH SERVICE FOR EDIT */
  useEffect(() => {
    if (
      mode !== "edit" ||
      !serviceId
    )
      return;

    const fetchService =
      async () => {
        try {
          setLoading(true);

          const res =
            await fetch(
              `/api/services/${serviceId}`,
              {
                credentials:
                  "include",
              }
            );

          const data =
            await res.json();

          const service =
            data.data?.service;

          if (!service) return;

          setForm({
            title:
              service.title || "",
            description:
              service.description ||
              "",
            categoryId:
              service.category?._id ||
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
              service.image || "",
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

    fetchService();
  }, [mode, serviceId]);

  /* SUBMIT */
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...form,
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
      };

      const endpoint =
        mode === "create"
          ? "/api/services"
          : `/api/services/${serviceId}`;

      const method =
        mode === "create"
          ? "POST"
          : "PUT";

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
        const errorData =
          await res.json();

        throw new Error(
          errorData.error ||
            "Failed to save service"
        );
      }

      window.dispatchEvent(
        new Event(
          "notifications-updated"
        )
      );

      setToast({
        type: "success",
        message:
          mode === "create"
            ? "Service created successfully"
            : "Service updated successfully",
      });

      setTimeout(() => {
        router.push(
          "/provider/services"
        );
      }, 700);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-4xl space-y-8">

        {/* HEADER */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 mb-1.5">
            Provider
          </p>

          <h1 className="text-3xl font-semibold text-slate-950">
            {mode === "create"
              ? "Create Service"
              : "Edit Service"}
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 leading-6 max-w-2xl">
            Add and manage your
            service information,
            pricing, and booking
            details.
          </p>
        </div>

        {/* ALERTS */}
        {toast && (
          <div
            className={`flex items-start gap-3 rounded-[18px] border px-5 py-4 text-sm ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {toast.type ===
            "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}

            <span>
              {toast.message}
            </span>
          </div>
        )}

        {/* FORM */}
        <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* FORM HEADER */}
          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-base font-semibold text-slate-900">
              Service Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Fill in the information
              below to publish your
              service.
            </p>
          </div>

          {/* FORM BODY */}
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6 px-6 py-6"
          >

            {/* TITLE */}
            <FormField
              label="Service Title"
              icon={
                <BriefcaseBusiness className="h-4 w-4" />
              }
            >
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title:
                      e.target
                        .value,
                  })
                }
                placeholder="Enter service title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </FormField>

            {/* DESCRIPTION */}
            <FormField
              label="Description"
              icon={
                <Text className="h-4 w-4" />
              }
            >
              <textarea
                rows={5}
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
                placeholder="Describe your service"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>

            {/* GRID */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* CATEGORY */}
              <FormField
                label="Category"
                icon={
                  <Tag className="h-4 w-4" />
                }
              >
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
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
              </FormField>

              {/* PRICE */}
              <FormField
                label="Price"
                icon={
                  <DollarSign className="h-4 w-4" />
                }
              >
                <input
                  type="number"
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
                  placeholder="0"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </FormField>

              {/* DURATION */}
              <FormField
                label="Duration"
                icon={
                  <Clock3 className="h-4 w-4" />
                }
              >
                <input
                  type="number"
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
                  placeholder="Duration in minutes"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  required
                />
              </FormField>

              {/* LOCATION */}
              <FormField
                label="Location"
                icon={
                  <MapPin className="h-4 w-4" />
                }
              >
                <input
                  type="text"
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
                  placeholder="Beirut, Lebanon"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </FormField>
            </div>

            {/* AVAILABILITY */}
            <FormField
              label="Availability"
              icon={
                <Clock3 className="h-4 w-4" />
              }
            >
              <input
                type="text"
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
                placeholder="Mon-Fri 9AM-5PM"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </FormField>

            {/* IMAGE */}
            <FormField
              label="Image URL"
              icon={
                <ImageIcon className="h-4 w-4" />
              }
            >
              <input
                type="text"
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
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </FormField>

            {/* SUBMIT */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {loading
                  ? "Saving..."
                  : mode ===
                    "create"
                  ? "Create Service"
                  : "Update Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="text-slate-400">
          {icon}
        </span>

        {label}
      </label>

      {children}
    </div>
  );
}