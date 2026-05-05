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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust",
    description:
      "We rigorously verify every service provider on our platform. Background checks, reviews, and real performance data ensure you always work with trusted professionals.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description:
      "Our AI-powered matching engine learns your preferences and connects you with the perfect provider—saving you time and delivering better results every time.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We believe in building strong local connections. Our platform fosters relationships between customers and providers that go beyond a single transaction.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We hold ourselves and our partners to the highest standards. Only top-rated, reliable professionals make it onto our curated marketplace.",
    color: "text-orange-600",
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
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated support team is always ready to help—before, during, and after your booking.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description:
      "Your transactions are encrypted and protected. Pay safely with multiple trusted payment options.",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full bg-white">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-95 h-80 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-80 bg-purple-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-sm font-medium text-blue-200 mb-6 border border-white/10">
            About Khidmati
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Connecting You with
            <br />
            <span className="text-blue-400">Trusted Local Services</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are on a mission to revolutionize how people discover and book
            services. With smart AI matching and a curated network of verified
            professionals, finding the right help has never been easier.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium transition shadow-lg shadow-blue-900/30"
            >
              Browse Services
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-medium transition backdrop-blur-sm"
            >
              Meet Our Providers
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <State />

      {/* ─── Mission & Story ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200">
                <Image
                  src="/hero.jpg"
                  alt="Khidmati team working together"
                  width={600}
                  height={450}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="rounded-full py-2"></div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 leading-tight">
              Built to Bridge the Gap Between Talent and Need
            </h2>
            <p className="mt-5 text-slate-600 leading-relaxed">
              Khidmati was born from a simple observation: finding reliable
              local services is harder than it should be. Whether you need a
              plumber at midnight or a tutor for your child, the search process
              is fragmented and frustrating.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We set out to change that. By combining cutting-edge AI with a
              deeply human approach to service, we have created a marketplace
              where quality meets convenience. Every provider is vetted, every
              review is genuine, and every booking is backed by our commitment
              to excellence.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Founded in 2026
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Based in Beirut, Lebanon
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-sm text-slate-700 font-medium">
                  Serving All of Lebanon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              What Drives Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
              Our Core Values
            </h2>
            <p className="mt-4 text-slate-600">
              These principles guide every decision we make and every feature we
              build.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition duration-300 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${value.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition`}
                >
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Platform Features ─── */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Why Khidmati
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3">
            A Platform Built for You
          </h2>
          <p className="mt-4 text-slate-600">
            Every feature is designed with one goal: making your experience
            seamless, secure, and satisfying.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 text-white p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Experience the Difference?
            </h2>
            <p className="mt-4 text-blue-100 text-lg">
              Join thousands of satisfied customers who found their perfect
              service provider on Khidmati.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-semibold transition shadow-lg"
              >
                Explore Services
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-blue-500/30 hover:bg-blue-500/40 text-white border border-white/30 px-8 py-3.5 rounded-xl font-medium transition backdrop-blur-sm"
              >
                Create an Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
