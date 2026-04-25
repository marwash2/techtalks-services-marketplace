"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, MapPin, Tag, Phone, Star } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";
import Loader from "@/components/shared/Loader";

interface ServiceDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  categoryId: {
    name: string;
  };
  providerId: {
    businessName: string;
    location: string;
    phone?: string;
  };
  reviews?: Array<{
    rating: number;
    comment: string;
  }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) {
          throw new Error("Service not found");
        }
        const data = await res.json();
        setService(data.data);
      } catch (err) {
        setError("Service not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">Loading service...</div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          title="Service not found"
          description="The service you are looking for does not exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* 🔷 HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">{service.title}</h1>

        <p className="text-gray-500 text-lg">
          {service.description || "No description available"}
        </p>
      </div>

      {/* 🔷 INFO CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <p className="text-sm text-gray-400">Category</p>
          <p className="font-semibold">{service.category?.name || "N/A"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Price</p>
          <p className="font-semibold text-blue-600">${service.price}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Location</p>
          <p className="font-semibold">{service.provider?.location || "N/A"}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Duration</p>
          <p className="font-semibold">{service.duration || "N/A"} mins</p>
        </div>
      </div>

      {/* 🔷 PROVIDER CARD */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Provider</p>

          <h3 className="text-xl font-semibold text-gray-800">
            {service.provider?.businessName || "Unknown provider"}
          </h3>

          {!session && (
            <p className="text-sm text-gray-400 mt-1">
              Login to view provider profile
            </p>
          )}
        </div>

        {/* 🔐 PROTECTED BUTTON */}
        {service.provider?._id && (
          <button
            onClick={() =>
              handleProtectedAction(() =>
                router.push(`/providers/${service.provider?._id}`),
              )
            }
            className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
          >
            View Profile →
          </button>
        )}
      </div>

      {/* 🔷 BOOKING SECTION */}
      <div className="bg-blue-50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Ready to book this service?
          </h3>

          {!session && (
            <p className="text-sm text-gray-500">Please log in to continue</p>
          )}
        </div>

        <button
          onClick={() =>
            handleProtectedAction(() => {
              alert("Booking flow coming soon");
            })
          }
          className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
