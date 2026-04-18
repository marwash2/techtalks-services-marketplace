"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "" , email: "", password: "", role: "user" });
  const [error, setError] = useState(""); // error message display
  const [loading, setLoading] = useState(false); // loading state for submit button


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="max-w-md mx-auto mt-10">
         {/*  page title*/}
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {/*  Signup form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name input */}
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2"
          required
        />
        {/* email input*/}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border p-2"
          required
        />
        {/* Password input*/}
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border p-2"
          required
        />
        {/* Role dropdown */}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-2"
        >
          <option value="user">User</option>
          <option value="provider">Provider</option>
        </select>

         {/* Error message */}
        {error && <p className="text-red-500">{error}</p>}

        
        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

      </form>
    </div>
  );
}
