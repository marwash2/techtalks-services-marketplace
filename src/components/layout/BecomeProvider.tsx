"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    <div className="bg-gray-50 border border-gray-100 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Want to offer your services?
      </h2>

      <p className="text-gray-600 mb-6">
        Join as a provider and start receiving requests from customers near you.
      </p>

      <button
        onClick={handleBecomeProvider}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
      >
        {!session
          ? "Register to Become a Provider"
          : session.user.role === "provider"
            ? "Go to Dashboard"
            : "Become a Provider"}
      </button>
    </div>
  );
}
