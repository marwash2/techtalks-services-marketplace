"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import HowItWorks from "@/components/home/HowItWorks";
import WhychooseUs from "@/components/home/WhyChooseUs";
import BecomeProviderSection from "@/components/layout/BecomeProvider";
import HeroSection from "@/components/layout/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedServices from "@/components/home/FeaturedServices";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { status, data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    // Redirect authenticated users to their role dashboard
    if (session.user.role === "provider") {
      router.replace("/provider/dashboard");
    } else if (session.user.role === "admin") {
      router.replace("/admin/dashboard");
    } else {
      router.replace("/user/dashboard");
    }
  }, [status, session, router]);

  // Show loading spinner while session is loading or redirecting
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden ">
      {/* Hero Section */}
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col gap-6">
        {/* Short App Description */}
        <section className="  relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-10 md:p-16 text-center">
          <p className="text-white-700 text-lg">
            Our platform connects you with trusted providers offering a wide
            range of services. Explore categories, compare ratings, and choose
            the best fit for your needs.
          </p>

          {/* CTA Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold transition shadow-lg"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/30 px-8 py-3.5 rounded-xl font-medium transition backdrop-blur-sm"
            >
              Find providers
            </Link>
          </div>
        </section>
        <section className="py-12">
          <HowItWorks />
        </section>
        {/*how it's work  */}
        <WhychooseUs />
        {/* Featured Categories */}
        <section className="py-12">
          <h2 className="text-xl md:text-4xl font-bold min-h-[1.5rem] text-slate-900">
            Popular Categories
          </h2>

          <p className="text-sm text-slate-500 min-h-[2.5rem] mt-2">
            Explore the most popular services trusted by thousands of users
          </p>
          <FeaturedCategories />
        </section>

        {/* Featured Services */}
        <section className="py-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-xl md:text-4xl font-bold text-slate-900 min-h-[1.5rem]">
                Featured Services
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Handpicked services <span className="text-blue-500">from</span>{" "}
                top-rated professionals
              </p>
            </div>
            <Link href="/services">
              <div className="hidden md:flex items-center gap-1 text-blue-500 text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer group">
                View all{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
          <FeaturedServices />
        </section>
      </div>

      <BecomeProviderSection />
    </div>
  );
}
