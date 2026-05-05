import { useEffect, useState } from "react";
import { Users, Heart, Zap, Star } from "lucide-react";
type HomeStats = {
  totalServices: number;
  totalProviders: number;
  totalCities: number;
};

export default function State() {
  const [stats, setStats] = useState<HomeStats>({
    totalServices: 0,
    totalProviders: 0,
    totalCities: 0,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error("Unable to load stats");

        const json = await res.json();
        const payload = json?.data ?? json;

        if (mounted && payload) {
          setStats({
            totalServices: payload.totalServices ?? 0,
            totalProviders: payload.totalProviders ?? 0,
            totalCities: payload.totalCities ?? 0,
          });
        }
      } catch {
        // Keep default values on error
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);
  const happyCustomers = stats.totalServices * 10;
  const allstats = [
    { label: "Services Offered", value: `${stats.totalServices}`, icon: Zap },
    {
      label: "Verified Providers",
      value: `${stats.totalProviders}`,
      icon: Users,
    },
    {
      label: "Happy Customers",
      value: `${happyCustomers.toLocaleString()}`,
      icon: Heart,
    },
    { label: "Average Rating", value: "4.8", icon: Star },
  ];
  return (
    <section className="border-y border-slate-100 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {allstats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-3">
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
