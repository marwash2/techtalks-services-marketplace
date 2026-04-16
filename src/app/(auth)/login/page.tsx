"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // NextAuth login
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false, // we handle redirect manually
      });

      // Error handling
      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      // Success → redirect
      window.location.href = "/";

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // UI
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 text-white rounded ${
            loading
              ? "bg-gray-400"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}