"use client";

import {
  Building2,
  Star,
  Users,
  Wrench,
  Heart,
} from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";

import AISearchBar from "../search/AiSearch";

type HomeStats = {
  totalServices: number;
  totalProviders: number;
  totalCities: number;
};

export default function HeroSection() {
  const [stats, setStats] =
    useState<HomeStats>({
      totalServices: 0,
      totalProviders: 0,
      totalCities: 0,
    });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const res = await fetch(
          "/api/stats"
        );

        if (!res.ok)
          throw new Error(
            "Unable to load stats"
          );

        const json =
          await res.json();

        const payload =
          json?.data ?? json;

        if (mounted && payload) {
          setStats({
            totalServices:
              payload.totalServices ??
              0,

            totalProviders:
              payload.totalProviders ??
              0,

            totalCities:
              payload.totalCities ??
              0,
          });
        }
      } catch {
        // Keep default values on error
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gray-100 py-0">
      <div className="w-full">
        {/* HERO CONTAINER */}
        <div className="relative flex items-center overflow-hidden bg-gray-100 px-6 py-14 md:px-10">
          
          {/* LEFT CONTENT */}
          <div className="z-10 w-full md:w-1/2 md:pl-6 lg:pl-10">
            <h1 className="leading-tight text-4xl font-bold text-slate-800">
              Find Trusted <br />
              Local Services
            </h1>

            <p className="mt-4 text-slate-500">
              Browse and book
              top-rated service
              providers <br />
              in your area.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              
              {/* SEARCH BAR */}
              <AISearchBar />

              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                
                {/* STATS */}
                <div className="flex flex-wrap items-end gap-6 text-sm text-slate-600">
                  
                  <div className="flex flex-col items-center px-3">
                    <Wrench className="h-5 w-5 text-blue-600" />

                    <span className="mt-1 font-semibold">
                      {stats.totalServices}
                      +
                    </span>

                    <span className="text-xs text-slate-400">
                      Services
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Users className="h-5 w-5 text-blue-600" />

                    <span className="mt-1 font-semibold">
                      {stats.totalProviders}
                      +
                    </span>

                    <span className="text-xs text-slate-400">
                      Providers
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Heart className="h-5 w-5 text-blue-600" />

                    <span className="mt-1 font-semibold">
                      {(
                        stats.totalServices *
                        10
                      ).toLocaleString()}
                      +
                    </span>

                    <span className="text-xs text-slate-400">
                      Happy Customers
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <Building2 className="h-5 w-5 text-blue-600" />

                    <span className="mt-1 font-semibold">
                      {
                        stats.totalCities
                      }
                    </span>

                    <span className="text-xs text-slate-400">
                      Covered Cities
                    </span>
                  </div>
                </div>

                {/* SERVICE CARD - DESKTOP ONLY */}
                <div className="hidden md:block translate-x-30 translate-y-2 rounded-xl bg-white p-4 shadow-md w-[150px] md:mr-2">
                  <p className="text-sm font-semibold text-slate-700">
                    House Cleaning
                  </p>

                  <div className="mt-1 flex items-center text-xs text-slate-500">
                    <Star className="mr-1 h-3.5 w-3.5 text-yellow-400" />

                    4.8 (120)
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    From $50 /
                    session
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE - DESKTOP ONLY */}
          <div className="absolute right-0 top-0 hidden h-full w-[60%] md:block">
            <Image
              src="/hero.jpg"
              alt="Hero Background"
              width={1200}
              height={800}
              className="h-full w-full rounded-xl object-cover
              [clip-path:ellipse(100%_60%_at_100%_35%)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}