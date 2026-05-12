import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

interface Service {
  _id: string;
  title: string;
  price: number;
}

interface ServicesPreviewProps {
  services: Service[];
}

const PREVIEW_LIMIT = 4;

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  const preview = services.slice(0, PREVIEW_LIMIT);
  const overflow = services.length - PREVIEW_LIMIT;

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Active services</h2>
        <Link
          href="/provider/services"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {preview.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <Briefcase className="mx-auto h-6 w-6 text-slate-300 mb-2" />
          <p className="text-xs text-slate-400">No active services yet.</p>
          <Link
            href="/provider/services/new"
            className="mt-3 inline-block text-xs font-medium text-blue-600 hover:underline"
          >
            Add your first service →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50">
          {preview.map((service) => (
            <li
              key={service._id}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 truncate max-w-[130px]">
                {service.title}
              </span>
              <span className="text-sm font-semibold text-slate-900 flex-shrink-0">
                ${service.price.toFixed(2)}
              </span>
            </li>
          ))}
          {overflow > 0 && (
            <li className="px-5 py-3">
              <Link
                href="/provider/services"
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
              >
                +{overflow} more service{overflow > 1 ? "s" : ""}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}