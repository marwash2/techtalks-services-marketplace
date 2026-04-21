"use client";

import { useEffect, useState } from "react";
import ServiceCard from "@/components/services/ServiceCard";

interface ServiceDTO {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: string | null;
  categoryId?: { name?: string } | string | null;
  providerId?: { businessName?: string; location?: string } | string | null;
}

export default function FeaturedServices() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch("/api/services?page=1&limit=3");
        const json = await res.json();
        console.log(json); 
        setServices(json.data.services);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  if (loading) return <p className="text-center py-6">Loading services...</p>;
  if (services.length === 0) return <p className="text-center py-6 text-gray-600">No services available yet</p>;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          providerLocation={
            typeof service.providerId === "object" ? service.providerId?.location : undefined
          }
        />
      ))}
    </div>
  );
}
