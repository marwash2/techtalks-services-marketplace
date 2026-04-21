"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import BecomeProviderSection from "@/components/layout/BecomeProvider";
import HeroSection from "@/components/layout/HeroSection";
import Button from "@/components/ui/Button";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedServices from "@/components/home/FeaturedServices";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      return;
    } // if not logged in, stay on homepage

    if (session.user.role === "provider") {
      router.push("/provider/dashboard");
    } else {
      router.push("/user/dashboard");
    }
  }, [session]);
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Section */}
      <HeroSection />

      {/* CTA Button */}
      <div className="text-center mt-6">
        <Button href="/services" variant="cta">
          Browse Services
        </Button>
      </div>

      {/* Short App Description */}
      <section className="py-8 text-center">
        <p className="text-gray-700 text-lg">
          Our platform connects you with trusted providers offering a wide range of services.
          Explore categories, compare ratings, and choose the best fit for your needs.
        </p>
      </section>

      {/* Featured Categories */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Categories</h2>
        <FeaturedCategories />
      </section>

      {/* Featured Services */}
      <section className="py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Services</h2>
        <FeaturedServices />
      </section>
      <BecomeProviderSection />
      {/*HERO SECTION: title+search*/}
      {/*Categories */}
      {/*featured Services */}
    </div>
  );
}
