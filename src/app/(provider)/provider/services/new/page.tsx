import ServiceForm from "@/components/provider/ServiceForm";

export default function NewServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ServiceForm mode="create" />
    </div>
  );
}