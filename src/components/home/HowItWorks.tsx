import { Search, CalendarDays, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50 shawdow-gray-200  shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">How It Works</h2>
          <p className="text-sm text-slate-500 mt-2">
            Get the job done in 3 simple steps
          </p>
        </div>

        {/* STEPS CONTAINER */}
        <div className="relative flex items-center justify-between">
          {/* DASHED LINE */}
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] border-t border-dashed border-slate-300 z-0"></div>

          {/* STEP 1 */}
          <div className="relative z-10 flex flex-col items-center text-center w-1/3">
            <div className="absolute -top-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              1
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4 shadow-sm">
              <Search className="h-6 w-6 text-blue-600" />
            </div>

            <h4 className="font-semibold text-slate-800 text-sm">
              Search Services
            </h4>

            <p className="text-xs text-slate-500 mt-1 max-w-[160px]">
              Find the perfect service for your needs.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="relative z-10 flex flex-col items-center text-center w-1/3">
            <div className="absolute -top-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              2
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4 shadow-sm">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>

            <h4 className="font-semibold text-slate-800 text-sm">
              Book & Schedule
            </h4>

            <p className="text-xs text-slate-500 mt-1 max-w-[160px]">
              Choose your preferred time and book instantly.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="relative z-10 flex flex-col items-center text-center w-1/3">
            <div className="absolute -top-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              3
            </div>

            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 mb-4 shadow-sm">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>

            <h4 className="font-semibold text-slate-800 text-sm">
              Get It Done
            </h4>

            <p className="text-xs text-slate-500 mt-1 max-w-[160px]">
              Our trusted professionals get the job done.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
