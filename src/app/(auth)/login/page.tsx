"use client";

import { useState } from "react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import GoogleIcon from "@/components/icons/GoogleIcon";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/auth/redirect");
    }
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/auth/redirect",
      });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Get session to determine role and redirect directly to dashboard
      const session = await getSession();
      const role = session?.user?.role;

      if (role === "provider") {
        window.location.href = "/provider/dashboard";
      } else if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        router.replace("/auth/redirect");
      }
    } catch {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  }
  // UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <h1 className="text-center text-lg font-semibold text-gray-900 mb-6"></h1>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Welcome back
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Log in to your account
          </p>

          {/* GOOGLE LOGIN */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/auth/redirect" })}
            className="w-full border border-gray-200 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer transition mb-4"
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M3 3l18 18"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M10.6 10.6A3 3 0 0013.4 13.4"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M9.9 5.1A10.8 10.8 0 0112 5c5.1 0 8.7 3.2 10 7-0.4 1.2-1.1 2.3-2 3.3"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M6.6 6.7C4.9 7.9 3.7 9.7 3 12c1.3 3.8 4.9 7 9 7 1.4 0 2.8-0.4 4-1.1"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"
                    />
                    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-right text-sm">
              <a
                href="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </p>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-sm text-gray-500 text-center mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
