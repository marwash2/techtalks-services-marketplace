"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/services/ServiceCard";

interface ServiceDTO {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  categoryId?:
    | {
        name?: string;
      }
    | null
    | string;
  providerId?:
    | {
        businessName?: string;
        location?: string;
      }
    | null
    | string;
}

export default function FeaturedServices() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services?page=1&limit=4");
        const json = await res.json();
        console.log(json);
        setServices(json.data.services || []);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  if (loading) return <p className="text-center py-6">Loading services...</p>;
  if (services.length === 0)
    return (
      <p className="text-center py-6 text-gray-600">
        No services available yet
      </p>
    );

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-4 ">
      {services.map((service, index) => (
        <ServiceCard
          key={service._id || service.id || index}
          service={{
            _id: service._id || service.id || "",
            title: service.title,
            description: service.description,
            price: service.price,
            duration: service.duration,
            image: service.image,
            categoryId:
              typeof service.categoryId === "object"
                ? service.categoryId
                : { name: "" },
            providerId:
              typeof service.providerId === "object"
                ? service.providerId
                : { location: "", businessName: "" },
          }}
        />
      ))}
    </div>
  );
}
