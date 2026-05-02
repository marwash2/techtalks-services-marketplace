"use client";
import { useSession } from "next-auth/react";

import HowItWorks from "@/components/home/HowItWorks";
import WhychooseUs from "@/components/home/WhyChooseUs";
import BecomeProviderSection from "@/components/layout/BecomeProvider";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/Button";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedServices from "@/components/home/FeaturedServices";

export default function Home() {
  const { status } = useSession();

  // Show loading spinner while session state is resolving
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-16">
        {/* Short App Description */}
        <section className=" border-gray-200 text-center">
          <p className="text-gray-700 text-lg">
            Our platform connects you with trusted providers offering a wide
            range of services. Explore categories, compare ratings, and choose
            the best fit for your needs.
          </p>

          {/* CTA Button */}
          <div className="text-center mt-6">
            <Button href="/services" variant="cta">
              Browse Services
            </Button>
          </div>
        </section>
        <HowItWorks />
        {/*how it's work  */}
        <WhychooseUs />
        {/* Featured Categories */}
        <section className="py-12">
          <h2 className="text-xl md:text-4xl font-bold text-slate-900">
            Popular Categories
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Explore the most popular services trusted by thousands of users
          </p>
          <FeaturedCategories />
        </section>

        {/* Featured Services */}
        <section className="py-12">
          <h2 className="text-xl md:text-4xl font-bold text-slate-900">
            Featured Services
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Handpicked services <span className="text-blue-500">from</span>{" "}
            top-rated professionals
          </p>
          <FeaturedServices />
        </section>
        {/*HERO SECTION: title+search*/}
        {/*Categories */}
        {/*featured Services */}
      </div>

      <BecomeProviderSection />
    </div>
  );
}
