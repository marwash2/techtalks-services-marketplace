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

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Fetch provider services
  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services?dashboard=true", {
        credentials: "include",
      });

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

  // Confirm delete service
  const confirmDeleteService = async () => {
    if (!selectedServiceId) return;

    try {
      const res = await fetch(`/api/services/${selectedServiceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Delete API Error:", errorData);
        throw new Error(errorData.message || "Delete failed");
      }

      // Remove deleted service from UI instantly
      setServices((prev) =>
        prev.filter((service) => service._id !== selectedServiceId)
      );

      // Close modal
      setShowDeleteModal(false);
      setSelectedServiceId(null);

    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete service");
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
            <h3 className="text-3xl font-bold">{services.length}</h3>
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

              {/* TABLE HEADER */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-5 font-semibold">Service</th>
                  <th className="text-left p-5 font-semibold">Category</th>
                  <th className="text-left p-5 font-semibold">Price</th>
                  <th className="text-left p-5 font-semibold">Duration</th>
                  <th className="text-left p-5 font-semibold">Actions</th>
                </tr>
              </thead>

              {/* TABLE BODY */}
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
                      {/* Service Name */}
                      <td className="p-5 font-medium">
                        {service.title}
                      </td>

                      {/* Category */}
                      <td className="p-5">
                        {service.category?.name || "N/A"}
                      </td>

                      {/* Price */}
                      <td className="p-5 text-blue-600 font-semibold">
                        ${service.price}
                      </td>

                      {/* Duration */}
                      <td className="p-5">
                        {service.duration} mins
                      </td>

                      {/* Actions */}
                      <td className="p-5">
                        <div className="flex gap-3">

                          {/* Edit Button */}
                          <Link
                            href={`/provider/services/edit_page/${service._id}`}
                            className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          >
                            Edit
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              setSelectedServiceId(service._id);
                              setShowDeleteModal(true);
                            }}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition cursor-pointer  "
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

      {/* PROFESSIONAL CUTE DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">

            {/* Cute warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-3xl">
                🗑️
              </div>
            </div>

            {/* Modal title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Delete Service
            </h2>

            {/* Modal description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete this service?
              <br />
              This action cannot be undone.
            </p>

            {/* Modal buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">

              {/* Cancel */}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedServiceId(null);
                }}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Keep Service
              </button>

              {/* Confirm Delete */}
              <button
                onClick={confirmDeleteService}
                className="px-5 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
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