"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (!res.ok && data.message) {
        router.push(data.resetLink.replace("http://localhost:3000", ""));
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-center text-lg font-semibold text-gray-900 mb-6">
          Smart Services
        </h1>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Forgot your password?
          </h2>

          <p className="text-sm text-gray-500 text-center mb-6">
            Enter your email to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {message && <p className="text-gray-600 text-sm">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
