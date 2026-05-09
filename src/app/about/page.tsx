"use client";

import State from "@/components/home/State";
import {
  ShieldCheck,
  Clock,
  Star,
  Users,
  Award,
  Headphones,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Lock,
  Phone,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "We rigorously verify every service provider on our platform. Background checks, reviews, and real performance data ensure you always work with trusted professionals.",
    iconColor: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description:
      "Our AI-powered matching engine learns your preferences and connects you with the perfect provider—saving you time and delivering better results every time.",
    iconColor: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We believe in building strong local connections. Our platform fosters relationships between customers and providers that go beyond a single transaction.",
    iconColor: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We hold ourselves and our partners to the highest standards. Only top-rated, reliable professionals make it onto our curated marketplace.",
    iconColor: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const features = [
  {
    icon: Clock,
    title: "Instant Booking",
    description:
      "Schedule services in seconds with our streamlined booking flow. No back-and-forth calls needed.",
  },
  {
    icon: Star,
    title: "Transparent Reviews",
    description:
      "Read honest, verified reviews from real customers to make informed decisions with confidence.",
  },
  {
    icon: Phone,
    title: "24/7 Support",
    description:
      "Our dedicated support team is always ready to help—before, during, and after your booking.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Your transactions are encrypted and protected. Pay safely with multiple trusted payment options.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-white">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white px-4 py-20 md:py-28 text-center">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            About Khidmati
          </span>

          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-5">
            Connecting You with
            <br />
            <span className="text-blue-400">Trusted Local Services</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            We're on a mission to revolutionize how people discover and book
            services. With smart AI matching and a curated network of verified
            professionals, finding the right help has never been easier.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition hover:-translate-y-0.5 shadow-lg shadow-blue-900/30"
            >
              Browse Services <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/16 text-white border border-white/20 px-7 py-3.5 rounded-xl font-medium text-sm transition backdrop-blur-sm"
            >
              Meet Our Providers
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <State />

      {/* ─── Story ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

          {/* Image side */}
          <div className="order-2 md:order-1 relative">
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-slate-200">
              <Image
                src="/hero.jpg"
                alt="Khidmati team working together"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-lg shadow-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800 leading-none">100% Verified</p>
                <p className="text-xs text-slate-400 mt-0.5">All providers vetted</p>
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="order-1 md:order-2 space-y-5">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Built to Bridge the Gap Between Talent and Need
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Khidmati was born from a simple observation: finding reliable
              local services is harder than it should be. Whether you need a
              plumber at midnight or a tutor for your child, the search process
              is fragmented and frustrating.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              We set out to change that. By combining cutting-edge AI with a
              deeply human approach to service, we've created a marketplace
              where quality meets convenience. Every provider is vetted, every
              review is genuine, and every booking is backed by our commitment
              to excellence.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {["Founded in 2026", "Based in Beirut, Lebanon", "Serving All of Lebanon"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
              What Drives Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
              Our Core Values
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 group cursor-default"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <value.icon className={`w-5 h-5 ${value.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">
            Why Khidmati
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-4">
            A Platform Built for You
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Every feature is designed with one goal: making your experience seamless, secure, and satisfying.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">{feature.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <div className="max-w-6xl mx-auto px-4 pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-10 md:p-16 text-center">
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/7 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 w-48 h-48 rounded-full bg-white/5 blur-2xl" />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed mb-8">
              Join thousands of satisfied customers who found their perfect service provider on Khidmati.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-7 py-3.5 rounded-xl font-bold text-sm transition hover:-translate-y-0.5 shadow-lg"
              >
                Explore Services <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/22 text-white border border-white/25 px-7 py-3.5 rounded-xl font-medium text-sm transition backdrop-blur-sm"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}