"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "user" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // send form data to out signup API endpoint
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, action: "signup" }),
    });
    // parse the response from the server
    const data = await res.json();
    alert(data.message || data.error);
  }

  return (
    <div className="max-w-md mx-auto mt-10">
         {/*  page title*/}
      <h1 className="text-2xl font-bold mb-4">Register</h1>

      {/*  Signup form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {/* Role dropdown user or provider*/}
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-2"
        >
          <option value="user">User</option>
          <option value="provider">Provider</option>
        </select>
        
        {/* Submit button */}
        <button type="submit" className="w-full bg-blue-500 text-white p-2">
          Sign Up
        </button>
      </form>
    </div>
  );
}