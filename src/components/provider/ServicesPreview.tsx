import Link from "next/link";
import { ArrowRight, Briefcase, Plus } from "lucide-react";

interface Service {
  _id: string;
  title: string;
  price: number;
}

interface ServicesPreviewProps {
  services: Service[];
}

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">
          Your Services ({services.length})
        </h3>
        <Link
          href="/provider/services"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Manage
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
          <Briefcase className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">No active services yet</p>
          <Link
            href="/provider/services"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-3 w-3" />
            Add your first service
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {services.slice(0, 3).map((service) => (
            <div
              key={service._id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Briefcase className="h-4 w-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {service.title}
                </p>
                <p className="text-xs text-slate-600">${service.price}</p>
              </div>
            </div>
          ))}
          {services.length > 3 && (
            <p className="text-center text-sm text-slate-600">
              +{services.length - 3} more services
            </p>
          )}
        </div>
      )}
    </div>
  );
}
