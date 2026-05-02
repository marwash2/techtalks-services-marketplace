"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/shared/EmptyState";

interface ServiceDetail {
  _id: string;
  id:string;
  title: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
  categoryId: { name: string };
  providerId: {
    id: string;
    _id?: string;
    businessName: string;
    location: string;
    phone?: string;
  };
  reviews?: Array<{ rating: number; comment: string }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Main service states
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { data: session } = useSession();

  // Fetch service details
  useEffect(() => {
    async function fetchService() {
      setLoading(true);

      try {
        const res = await fetch(`/api/services/${id}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();

        setService(data.data.service || data.service);
      } catch {
        setError("Service not found");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchService();
  }, [id]);

  // Protected actions handler
  // Shows custom login modal instead of ugly browser alert
  const handleProtectedAction = (
    action: () => void,
    actionName: string
  ) => {
    if (!session) {
      setLoginAction(actionName);
      setShowLoginModal(true);
      return;
    }

    action();
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-400">Loading service...</div>
    );
  }

  // Error / Empty state
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

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">{service.title}</h1>
        <p className="text-gray-500 text-lg">
          {service.description || "No description available"}
        </p>
      </div>

      {/* SERVICE INFO CARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-sm border">
        <div>
          <p className="text-sm text-gray-400">Category</p>
          <p className="font-semibold">{service.categoryId?.name || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Price</p>
          <p className="font-semibold text-blue-600">${service.price}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Location</p>
          <p className="font-semibold">{service.providerId?.location || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Duration</p>
          <p className="font-semibold">{service.duration || "N/A"} mins</p>
        </div>
      </div>

      {/* PROVIDER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Provider</p>
          <h3 className="text-xl font-semibold text-gray-800">
            {service.providerId?.businessName || "Unknown provider"}
          </h3>
          {!session && (
            <p className="text-sm text-gray-400 mt-1">Login to view provider profile</p>
          )}
        </div>
        <button
          onClick={() =>
            handleProtectedAction(() =>
              router.push(`/providers/${service.providerId.id ?? service.providerId._id}`)
            )
          }
          className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
        >
          View Profile →
        </button>
      </div>

      {/* BOOKING */}
      <div className="bg-blue-50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Ready to book this service?</h3>
          {!session && (
            <p className="text-sm text-gray-500">Please log in to continue</p>
          )}
        </div>
        <button
          onClick={() =>
            handleProtectedAction(() => {
              router.push(`/bookings/${service.id ?? service._id}`);
            })
          }
          className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
        >
          Book Now
        </button>
      </div>

      {/* CUSTOM LOGIN REQUIRED MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">
            
            {/* Cute lock icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl">
                🔐
              </div>
            </div>

            {/* Modal title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Login Required
            </h2>

            {/* Modal description */}
            <p className="text-gray-600 leading-relaxed mb-6">
              Please log in or create an account to continue and{" "}
              {loginAction}.
            </p>

            {/* Modal buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              
              {/* Close button */}
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Maybe Later
              </button>

              {/* Login button */}
              <Link
                href="/login"
                className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Log In
              </Link>

              {/* Signup button */}
              <Link
                href="/register"
                className="px-5 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
