"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

// NextAuth
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Get session from NextAuth
  const { data: session } = useSession();

  // Detect active link
  const isActive = (path: string) => pathname === path;

  // Extract role safely
  const role = session?.user?.role;

  // Guest links
  const guestLinks = [
    { name: "Home", path: "/" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" },
  ];

  // User links
  const userLinks = [
    { name: "Dashboard", path: "/user/dashboard" },
    { name: "Explore Services", path: "/user/services" },
    { name: "My Bookings", path: "/user/bookings" },
    { name: "Profile", path: "/user/profile" },
    { name: "AI Assistant", path: "/user/ai-assistant" },
  ];

  // Provider links
  const providerLinks = [
    { name: "Dashboard", path: "/provider/dashboard" },
    { name: "My Services", path: "/provider/services" },
    { name: "Bookings", path: "/provider/bookings" },
    { name: "Profile", path: "/provider/profile" },
    { name: "Availability", path: "/provider/availability" },
  ];

  // Admin links
  const adminLinks = [
    { name: "Dashboard", path: "/admin" },
    { name: "Users", path: "/admin/users" },
    { name: "Providers", path: "/admin/providers" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Categories", path: "/admin/categories" },
    { name: "My Services", path: "/admin/services" },
  ];

  // Role-based navigation (NextAuth)
  const getLinks = () => {
    if (!session) return guestLinks;
    if (role === "admin") return adminLinks;
    if (role === "provider") return providerLinks;
    return userLinks;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-800">
            <span className="text-blue-600">Matchify</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {getLinks().map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-sm font-medium transition ${
                isActive(link.path)
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          {!session ? (
            <>
              {/* Guest */}
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-blue-600"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Provider CTA */}
              {role === "provider" && (
                <Link
                  href="/provider/services/new"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  + Add Service
                </Link>
              )}

              {/* Admin label */}
              {role === "admin" && (
                <span className="text-sm text-gray-500">
                  Admin Panel
                </span>
              )}

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1 rounded-md text-sm text-red-500 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          {getLinks().map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="block text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {!session ? (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register" className="text-blue-600 font-semibold">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-500"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}