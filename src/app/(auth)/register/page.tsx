"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get("role");
  const selectedRole = roleFromUrl === "provider" ? "provider" : "user";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: selectedRole,
  });
  const [error, setError] = useState(""); // error message display
  const [loading, setLoading] = useState(false); // loading state for submit button
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // send form data to out signup API endpoint
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create account");
        setLoading(false);
        return;
      }
      const loginResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/auth/redirect",
      });
      if (loginResult?.error) {
        setError(
          "Account created but failed to log in. Please try logging in manually.",
        );
        setLoading(false);
        return;
      }

      router.push(
        form.role === "provider" ? "/provider/dashboard" : "/user/dashboard",
      );
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 className="text-center text-lg font-semibold text-gray-900 mb-6"></h1>
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Create your account
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            {selectedRole === "provider"
              ? "Create a provider account and start offering services"
              : "Join and find the best services"}
          </p>

          {/* GOOGLE LOGIN */}
          {selectedRole !== "provider" && (
            <>
              <button
                onClick={() => signIn("google")}
                className="w-full border border-gray-200 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition mb-4"
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3l18 18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.6 10.6A3 3 0 0013.4 13.4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.9 5.1A10.8 10.8 0 0112 5c5.1 0 8.7 3.2 10 7-0.4 1.2-1.1 2.3-2 3.3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.6 6.7C4.9 7.9 3.7 9.7 3 12c1.3 3.8 4.9 7 9 7 1.4 0 2.8-0.4 4-1.1" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
            {/* Footer */}
            <p className="text-sm text-gray-500 text-center mt-6">
              already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
