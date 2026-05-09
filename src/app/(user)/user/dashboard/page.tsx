"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recommendedServices, setRecommendedServices] = useState<
    { id: string; title: string; desc: string }[]
  >([]);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !session) {
      router.replace("/login");
      return;
    }

    if (session.user.role === "provider") {
      router.replace("/provider/dashboard");
    }

    if (session.user.role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    const loadRecommendedServices = async () => {
      try {
        const res = await fetch("/api/services?limit=4", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const services = data?.data?.services ?? data?.services ?? [];
        setRecommendedServices(
          services.map((s: any) => ({
            id: s.id || s._id || Math.random().toString(36),
            title: s.title || "Service",
            desc: s.description || "Reliable local service providers near you.",
          })),
        );
      } catch {
        // keep fallback cards
      }
    };

    void loadRecommendedServices();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f6ff]">
        <div className="h-14 w-14 rounded-full border-b-2 border-blue-500 animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "user") return null;

  return (
    <div className="min-h-screen bg-[#f0f6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 border-[1.5px] border-blue-200 p-8 md:p-10">

          <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 w-48 h-48 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-[1fr_auto] gap-8 items-center">

            <div>
              <span className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" />
                Welcome Back
              </span>

              <h1
                className="font-bold text-3xl md:text-4xl text-[#1e3a5f] leading-tight mb-3"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                Hello, {session.user.name || "User"}
              </h1>

              <p className="text-[#4b6fa8] text-sm leading-relaxed max-w-2xl mb-6">
                Manage your bookings and discover trusted providers
                from one elegant dashboard.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/user/services">
                  <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-full px-5 py-3 text-sm font-semibold shadow-sm">
                    Explore Services
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link href="/user/bookings">
                  <button className="inline-flex items-center gap-2 bg-white border-[1.5px] border-blue-200 hover:bg-blue-50 transition text-[#1e3a5f] rounded-full px-5 py-3 text-sm font-medium">
                    My Bookings
                  </button>
                </Link>
              </div>
            </div>

            {/* RIGHT CARD */}
            <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-3xl p-6 min-w-[260px] shadow-sm">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mx-auto mb-4">
                <CalendarDays className="w-8 h-8 text-blue-600" />
              </div>

              <p className="text-xs uppercase tracking-widest text-blue-500 font-semibold text-center mb-1">
                Upcoming
              </p>

              <h2
                className="text-5xl text-center text-[#1e3a5f]"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                3
              </h2>

              <p className="text-sm text-[#6b93c4] text-center mt-2">
                scheduled bookings
              </p>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* LEFT */}
          <div className="space-y-5">

            {/* RECENT BOOKINGS */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl text-[#1e3a5f] mb-1"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    Recent Bookings
                  </h2>

                  <p className="text-sm text-[#6b93c4]">
                    Your latest scheduled services
                  </p>
                </div>

                <Link
                  href="/user/bookings"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3">

                <div className="flex items-center justify-between border border-blue-100 rounded-2xl p-4 hover:bg-blue-50/40 transition">
                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-[#1e3a5f]">
                        Premium Home Cleaning
                      </p>

                      <p className="text-sm text-[#6b93c4]">
                        Tomorrow · 10:00 AM
                      </p>
                    </div>
                  </div>

                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-center justify-between border border-blue-100 rounded-2xl p-4 hover:bg-blue-50/40 transition">
                  <div className="flex items-center gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-indigo-600" />
                    </div>

                    <div>
                      <p className="font-semibold text-[#1e3a5f]">
                        Plumbing Inspection
                      </p>

                      <p className="text-sm text-[#6b93c4]">
                        April 30 · 3:00 PM
                      </p>
                    </div>
                  </div>

                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Pending
                  </span>
                </div>

              </div>
            </div>

            {/* RECOMMENDED */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-6">

              <div className="mb-6">
                <h2
                  className="text-2xl text-[#1e3a5f] mb-1"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Recommended Services
                </h2>

                <p className="text-sm text-[#6b93c4]">
                  Curated for you
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                {[
                  {
                    icon: Zap,
                    iconStyle: "text-yellow-500",
                    bg: "bg-yellow-50",
                    title: "Electrical Maintenance",
                  },
                  {
                    icon: Sparkles,
                    iconStyle: "text-sky-500",
                    bg: "bg-sky-50",
                    title: "Deep Cleaning",
                  },
                  {
                    icon: PanelsTopLeft,
                    iconStyle: "text-indigo-500",
                    bg: "bg-indigo-50",
                    title: "Window Installation",
                  },
                  {
                    icon: Trees,
                    iconStyle: "text-green-500",
                    bg: "bg-green-50",
                    title: "Landscaping",
                  },
                ].map((service) => (
                  <div
                    key={service.title}
                    className="border border-blue-100 rounded-2xl p-5 hover:bg-blue-50/40 transition cursor-pointer"
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl ${service.bg} flex items-center justify-center mb-4`}
                    >
                      <service.icon className={`w-5 h-5 ${service.iconStyle}`} />
                    </div>

                    <h3 className="font-semibold text-[#1e3a5f]">
                      {service.title}
                    </h3>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-5">

            {/* PROFILE */}
            <div className="bg-white border-[1.5px] border-blue-100 rounded-3xl p-7">

              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto text-white text-3xl mb-5">
                {(session.user.name?.[0] || "U").toUpperCase()}
              </div>

              <div className="text-center mb-6">
                <h2
                  className="text-2xl text-[#1e3a5f] mb-1"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {session.user.name || "User"}
                </h2>

                <p className="text-sm text-[#6b93c4]">
                  {session.user.email}
                </p>
              </div>

              <Link href="/user/profile">
                <button className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded-2xl py-3 text-sm font-semibold">
                  Manage Account
                </button>
              </Link>
            </div>

            {/* SUPPORT */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-7 text-white">

              <div className="absolute -bottom-16 -right-12 w-52 h-52 rounded-full border border-white/10" />

              <div className="relative z-10">

                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                  <User className="w-7 h-7" />
                </div>

                <h3
                  className="text-2xl mb-3"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  Need Help?
                </h3>

                <p className="text-sm text-blue-100 leading-relaxed mb-6">
                  Our support team is available anytime for assistance.
                </p>

                <Link href="/support">
                  <button className="w-full bg-white text-blue-700 hover:bg-blue-50 transition rounded-2xl py-3 text-sm font-semibold">
                    Contact Support
                  </button>
                </Link>

              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
