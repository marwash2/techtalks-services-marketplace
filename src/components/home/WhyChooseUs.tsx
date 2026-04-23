import { ShieldCheck, Lock, Clock, Star, CheckCircle } from "lucide-react";
import FeaturedCard from "@/components/ui/FeaturedCard";
export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-gray-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Why Choose <span className="text-blue-600">Our Platform</span>
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            We connect you with trusted service providers using smart matching
            technology. Every interaction is designed to be fast, secure, and
            reliable.
          </p>

          {/* BULLETS */}
          <ul className="mt-6 space-y-3">
            {[
              "Verified and trusted service providers",
              "Transparent pricing with no hidden fees",
              "Fast booking and easy scheduling",
              "Smart recommendations powered by AI",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-slate-600 text-sm"
              >
                <CheckCircle className="h-5 w-5 text-blue-600" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT CARDS */}
        <div className="grid grid-cols-2 gap-4">
          {/* CARD */}
          <FeaturedCard
            icon={<ShieldCheck className="text-green-600" />}
            title="Verified Providers"
            desc="All providers go through strict validation and background checks."
          />

          <FeaturedCard
            icon={<Lock className="text-blue-600" />}
            title="Secure Booking"
            desc="Your data and transactions are protected at every step."
          />

          <FeaturedCard
            icon={<Clock className="text-orange-500" />}
            title="24/7 Support"
            desc="Get help anytime with our dedicated support system."
          />

          <FeaturedCard
            icon={<Star className="text-purple-600" />}
            title="Top Quality"
            desc="We match you with the highest-rated professionals."
          />
        </div>
      </div>
    </section>
  );
}
