"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Service = {
  _id: string;
  title: string;
  price: number;
  duration: number;
  category?: {
    name?: string;
  } | null;
};

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch provider services
  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?dashboard=true", {
      credentials: "include",
   })
      const data = await res.json();
      console.log("Fetched provider services:", data);

      setServices(data.data?.services || []);
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Delete service
  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      setServices((prev) =>
        prev.filter((service) => service._id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete service");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Services Management
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your services, pricing, and availability
            </p>
          </div>

          <Link
            href="/provider/services/new"
            className="mt-4 md:mt-0 inline-flex items-center bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            + Add New Service
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <p className="text-gray-500">Total Services</p>
            <h3 className="text-3xl font-bold">
              {services.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <p className="text-gray-500">Active Services</p>
            <h3 className="text-3xl font-bold text-green-600">
              {services.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <p className="text-gray-500">Starting Price</p>
            <h3 className="text-3xl font-bold text-blue-600">
              $
              {services.length > 0
                ? Math.min(...services.map((s) => s.price))
                : 0}
            </h3>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">

              {/* HEADER */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-5 font-semibold">
                    Service
                  </th>
                  <th className="text-left p-5 font-semibold">
                    Category
                  </th>
                  <th className="text-left p-5 font-semibold">
                    Price
                  </th>
                  <th className="text-left p-5 font-semibold">
                    Duration
                  </th>
                  <th className="text-left p-5 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* BODY */}
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-8 text-gray-400"
                    >
                      Loading services...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center p-8 text-gray-400"
                    >
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    
                    <tr
                      key={service._id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      <td className="p-5 font-medium">
                        {service.title}
                      </td>

                      <td className="p-5">
                        {service.category?.name || "N/A"}
                      </td>

                      <td className="p-5 text-blue-600 font-semibold">
                        ${service.price}
                      </td>

                      <td className="p-5">
                        {service.duration} mins
                      </td>

                      <td className="p-5">
                        <div className="flex gap-3">
                          <Link
                            href={`/provider/services/edit_page/${service._id}`}
                            className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() =>
                              handleDelete(service._id)
                            }
                            className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}