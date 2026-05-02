import { Search, MapPin, Star, Users, Heart } from "lucide-react";
import Image from "next/image";
export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gray-100 py-4">
      <div className="w-full">
        <div className="md:hidden w-full h-[220px] mb-6">
          {/* IMAGE */}
          {/*} <img
            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
            className="w-full h-full object-cover rounded-xl
            [clip-path:ellipse(100%_60%_at_100%_35%)]"
          />*/}

          <Image
            src="/hero.jpg"
            alt="Hero Background"
            width={1200}
            height={800}
            className="w-full h-full object-cover rounded-xl
            [clip-path:ellipse(100%_60%_at_100%_35%)]"
          />
        </div>

        {/* HERO CONTAINER */}
        <div className="relative bg-gray-100 px-6 md:px-10 py-14 overflow-hidden flex items-center">
          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/2 z-10 md:pl-6 lg:pl-10">
            <h1 className="text-4xl font-bold text-slate-800 leading-tight">
              Find Trusted <br /> Local Services
            </h1>

            <p className="mt-4 text-slate-500">
              Browse and book top-rated service providers <br />
              in your area.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {/* SEARCH BAR */}
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full w-fit">
                {/* INPUT */}
                <div className="flex items-center px-4 w-[220px] w-full">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search for services..."
                    className="ml-2 py-3 text-sm outline-none w-full"
                  />
                </div>

                {/* LOCATION */}
                <div className="flex items-center px-4 border-l w-[180px]">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="ml-2 text-sm text-slate-500">Lebanon</span>
                </div>

                {/* BUTTON */}
                <button className="bg-blue-600 text-white px-6 py-3 text-sm hover:bg-blue-700 cursor-pointer">
                  Search
                </button>
              </div>

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* STATS */}
                <div className="flex flex-wrap items-end gap-6 text-sm text-slate-600">
                  <div className="flex flex-col items-center">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold mt-1">500+</span>
                    <span className="text-xs text-slate-400">Services</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold mt-1">200+</span>
                    <span className="text-xs text-slate-400">Providers</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Heart className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold mt-1">5K+</span>
                    <span className="text-xs text-slate-400">
                      Happy Customers
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="font-semibold mt-1">4.8</span>
                    <span className="text-xs text-slate-400">Avg. Rating</span>
                  </div>
                </div>

                {/* SERVICE CARD */}
                <div className="bg-white translate-x-30 translate-y-2 shadow-md rounded-xl shadow-md p-4 w-[150px] md:mr-2">
                  <p className="text-sm font-semibold text-slate-700">
                    House Cleaning
                  </p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 mr-1" />
                    4.8 (120)
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    From $50 / session
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden md:block absolute right-0 top-0 h-full w-[55%]">
            {/* IMAGE */}
            <img
              src="https://images.unsplash.com/photo-1581578731548-c64695cc6952"
              className="h-full w-full object-cover
               [clip-path:ellipse(100%_60%_at_100%_35%)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
