"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <article
        className="
        w-full max-w-sm mx-auto h-[480px] flex flex-col overflow-hidden rounded-[28px]
        border border-slate-200/50 bg-white/80 backdrop-blur-sm shadow-2xl
        hover:shadow-3xl transition-all duration-300 hover:-translate-y-2
      "
      >
        {/* HEADER - Big AlertCircle (red theme) */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-red-50/80 to-rose-100/80">
          <AlertCircle className="h-24 w-24 sm:h-28 sm:w-28 text-red-500 drop-shadow-2xl animate-pulse" />
        </div>

        {/* CONTENT */}
        <div className="p-6 pb-8 flex flex-col flex-1 justify-between">
          {/* TITLE - Red matching icon */}
          <div className="space-y-2 text-center">
            <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent drop-shadow-lg">
              Something went wrong
            </h3>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[280px] mx-auto">
              We&apos;re having trouble loading this page.
            </p>
          </div>

          {/* SMALL BOTTOM BUTTONS */}
          <div className="pt-4 space-y-2">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-2.5 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-200"
            >
              Try Again
            </button>
            <Button
              href="/"
              variant="outline"
              className="w-full px-6 py-2.5 text-sm font-medium rounded-xl border-slate-200 hover:bg-slate-50 shadow-md text-slate-700"
            >
              Go Home
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
