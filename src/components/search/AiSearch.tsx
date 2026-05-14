"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const hints = [
  "Find trusted cleaners near you...",
  "Need an electrician available today?",
  "Describe your problem naturally...",
  "AI can recommend the best providers...",
  "Find affordable plumbers instantly...",
  "Need urgent AC repair tonight?",
];

export default function AISearchBar() {
  const [currentHint, setCurrentHint] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentHint((prev) => (prev + 1) % hints.length);
        setFade(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* SEARCH CONTAINER */}
      <div className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
        {/* GRADIENT BORDER EFFECT */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-sky-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex flex-row gap-1 p-4 sm:flex-row sm:items-center sm:gap-3">
          {/* INPUT AREA */}
          <div className="min-w-0 flex-1">
            {/* FAKE INPUT */}
            <button className="flex h-11 w-full items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 text-left transition-all duration-300 hover:border-blue-200 hover:bg-white">
              <span
                className={`truncate text-sm sm:text-base transition-all duration-300 ${
                  fade ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                } text-slate-500`}
              >
                {hints[currentHint]}
              </span>
            </button>
          </div>

          {/* RIGHT BUTTON */}
          <button className="flex h-10 items-center justify-center gap-1 rounded-2xl bg-blue-600 px-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 sm:w-auto">
            <Sparkles className="h-4 w-4" />

            <span>Ask AI</span>

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
