import Input from "../search/SearchBar";
import Button from "../ui/Button";
import Image from "next/image";
import heroImage from "@/hero.jpg";

export default function HeroSection() {
  return (
    <section className="bg-gray-50  bg-center">
      <div className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* LEFT SIDE */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Find Trusted <br /> Local Services
          </h1>

          <p className="text-gray-500 mb-6 max-w-md">
            Browse and book top-rated service providers in your area.
          </p>

          {/* Search Bar */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm max-w-md">
            <input
              placeholder="Search for services..."
              className="flex-1 px-4 py-2 outline-none text-sm"
            />

            <div className="px-3 text-sm text-gray-400 border-l">Beirut</div>

            <button className="bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700 transition">
              Search
            </button>
          </div>
        </div>

        {/* RIGHT SIDE (IMAGE) */}
        <div className="hidden md:block ">
          <Image
            src={heroImage}
            alt="Hero"
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
