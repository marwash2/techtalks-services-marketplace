"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function BecomeProviderSection() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleBecomeProvider() {
    if (!session) {
      router.push("/register?role=provider");
      return;
    }
    if (session.user.role === "provider ") {
      router.push("/provider/dashboard");
    } else {
      alert(
        "Your account is currently a user account. To become a provider, please click OK to upgrade your account.",
      );
    }
  }

  return (
    <section className="relative w-full overflow-hidden bg-gray-100 py-10 md:py-14">
      <div className="w-full">
        <div className="md:hidden w-full h-[220px] mb-6 px-4">
          <Image
            src="/download.jpg"
            alt="Become Provider"
            width={900}
            height={500}
            className="w-full h-full object-cover rounded-xl"
            loading="eager"
          />
        </div>

        <div className="relative bg-gray-100 px-6 md:px-10 py-14 overflow-hidden flex items-center min-h-[420px]">
          {/* LEFT CONTENT */}
          <div className="w-full md:w-1/2 z-10 md:pl-6 lg:pl-10">
            <h2 className="text-4xl font-bold text-slate-800 leading-tight">
              Want to Offer <br /> Your Services?
            </h2>

            <p className="mt-4 text-slate-500 max-w-xl">
              Join as a provider and start receiving requests from customers
              near you. Grow your business with our smart matching platform.
            </p>

            <button
              onClick={handleBecomeProvider}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg cursor-pointer"
            >
              {!session
                ? "Register to Become a Provider"
                : session.user.role === "provider"
                  ? "Go to Dashboard"
                  : "Become a Provider"}
            </button>
          </div>

          {/* RIGHT IMAGE */}
          <div className="hidden md:block absolute right-0 top-0 h-full w-[55%]">
            <Image
              src="https://img.freepik.com/free-photo/two-men-shaking-hands_53876-63180.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Become Provider"
              fill
              className="h-full w-full object-cover [clip-path:ellipse(100%_60%_at_100%_35%)]"
              sizes="55vw"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
