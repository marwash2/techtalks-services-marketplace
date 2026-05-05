"use client";

import { useParams } from "next/navigation";
import ServiceForm from "@/components/provider/ServiceForm";

export default function EditServicePage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : "";

  console.log(
    "Editing service ID:",
    id
  );

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">
          Invalid service ID
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ServiceForm
        mode="edit"
        serviceId={id}
      />
    </div>
  );
}