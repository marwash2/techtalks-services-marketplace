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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-12">
        <Loader />
      </div>
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

  const avgRating = service.reviews?.length
    ? service.reviews.reduce((sum, r) => sum + r.rating, 0) /
      service.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/services"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to services
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN DETAIL */}
          <div className="lg:col-span-2">
            {/* HERO IMAGE */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-3xl overflow-hidden mb-8 shadow-xl">
              {service.image ? (
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-gray-500">
                    {service.title}
                  </h2>
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                    <Tag className="w-4 h-4" />
                    {service.categoryId.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" />
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {service.title}
              </h1>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Tag className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(service.price)}
                    </p>
                    <p className="text-sm text-gray-500">Starting price</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {service.duration} min
                    </p>
                    <p className="text-sm text-gray-500">Duration</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-lg max-w-none mb-12">
                <p>{service.description}</p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg">
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  className="px-8 py-4 text-lg font-semibold rounded-2xl"
                >
                  Contact Provider
                </Button>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div>
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-200 sticky top-24 h-fit">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.providerId.businessName}
                </h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-5 h-5" />
                  {service.providerId.location}
                </div>
                {service.providerId.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5" />
                    {service.providerId.phone}
                  </div>
                )}
              </div>

              {service.reviews && service.reviews.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Reviews
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {service.reviews.slice(0, 3).map((review, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex gap-0.5 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
