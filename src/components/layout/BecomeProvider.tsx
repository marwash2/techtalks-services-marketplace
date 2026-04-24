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
    <section className="bg-gray-100 py-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        {/* LEFT SIDE */}
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Want to offer your services?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md text-lg">
            Join as a provider and start receiving requests from customers near
            you. Grow your business with our smart matching platform.
          </p>
          <button
            onClick={handleBecomeProvider}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
          >
            {!session
              ? "Register to Become a Provider"
              : session.user.role === "provider"
                ? "Go to Dashboard"
                : "Become a Provider"}
          </button>
        </div>

        {/* RIGHT SIDE (IMAGE) */}
        <div className="hidden md:block">
          <Image
            src="/download.jpg"
            alt="Become Provider"
            width={600}
            height={400}
            className="w-full h-auto object-cover rounded-lg shadow-lg"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
