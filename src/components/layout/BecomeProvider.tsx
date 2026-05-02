"use client";

import Image from "next/image";
import BecomeProviderButtons from "@/components/layout/BecomeProviderButtons";

export default function BecomeProviderSection() {
  return (
    <section className=" bg-white relative w-full overflow-hidden bg-gray-100 py-10 md:py-4 ">
      <div className="w-full">
        <div className=" md:hidden w-full h-[220px] mb-6 px-4 ">
          <Image
            src="/download.jpg"
            alt="Become Provider"
            width={900}
            height={500}
            className="w-full h-full object-cover rounded-xl"
            loading="eager"
          />
        </div>

        <div className="relative bg-gray-100 px-6 md:px-10 py-14 overflow-hidden flex items-center min-h-[350px]">
          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/2 z-10 md:pl-6 lg:pl-10">
            <h2 className="text-4xl font-bold text-slate-800 leading-tight">
              Want to Offer <br /> Your Services?
            </h2>

            <p className="mt-4 text-slate-500 max-w-xl">
              Join as a provider and start receiving requests from customers
              <br />
              near you. Grow your business with our smart matching platform.
            </p>

            <BecomeProviderButtons />
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden md:block absolute right-0 top-0 h-full w-[55%]">
            <Image
              src="/becomeProvider-bg.jpeg"
              alt="Become Provider"
              width={1200}
              height={800}
              className="h-full w-full object-cover [clip-path:ellipse(100%_60%_at_100%_35%)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
