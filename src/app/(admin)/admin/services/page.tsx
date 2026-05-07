"use client";

import { useEffect, useState } from "react";

export default function ManageServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchServices() {
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      const list = data.data?.services || [];
      setServices(list);
      setFilteredServices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchServices();
  }, []);
   useEffect(() => {
    const filtered = services.filter((s) =>
      s.title?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [search, services]);

async function deleteService(id: string) {
    if (!confirm("Are you sure?")) return;

    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete service");
        return;
      }

      await fetchServices();

    } catch (error) {
      console.error(error);
    }
  }
   if (loading) return <div className="p-6">Loading services...</div>;

    return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Services</h1>

      {/* SEARCH */}
      <input
        placeholder="Search services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full border p-2 rounded"
      />

       <table className="w-full border rounded overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Title</th>
            <th className="p-2">Price</th>
            <th className="p-2">Provider</th>
            <th className="p-2">Created At</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
         <tbody>
          {filteredServices.map((service) => (
            <tr key={service.id} className="border-t">
              <td className="p-2">{service.title}</td>
              <td className="p-2">${service.price}</td>
              <td className="p-2">
                {service.providerId?.businessName || "-"}
              </td>
              <td className="p-2">
                {service.createdAt
                  ? new Date(service.createdAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2">
                <button
                  onClick={() => deleteService(service.id)}
                  className="text-red-600"
                >
                  Delete
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}