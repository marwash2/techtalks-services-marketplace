import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <article
        className="
        w-full max-w-sm mx-auto h-[380px] flex flex-col overflow-hidden rounded-[28px]
        border border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-2xl
        hover:shadow-3xl transition-all duration-300 hover:-translate-y-2
      "
      >
        {/* HEADER - Big AlertTriangle */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-orange-50/80 to-rose-50/80">
          <AlertTriangle className="h-24 w-24 sm:h-28 sm:w-28 text-orange-500 drop-shadow-2xl animate-pulse" />
        </div>

        {/* CONTENT */}
        <div className="p-6 pb-8 flex flex-col flex-1 justify-between">
          {/* TITLE - Orange matching triangle */}
          <div className="space-y-2 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg">
              Page Not Found
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[280px] mx-auto">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>
          </div>

          {/* SMALL BOTTOM BUTTON */}
          <div className="pt-4">
            <Button
              href="/"
              variant="outline"
              className="text-center w-full px-6 py-2.5 text-sm font-medium rounded-xl border-slate-200 hover:bg-orange-50 shadow-md text-slate-700"
            >
              Go Home
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
