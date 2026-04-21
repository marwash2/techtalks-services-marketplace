"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  const role = session?.user?.role;

  const isActive = (path: string) => pathname === path;

  const links = !session
    ? [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: "Providers", path: "/providers" },
      ]
    : role === "admin"
      ? [
          { name: "Dashboard", path: "/admin" },
          { name: "Users", path: "/admin/users" },
          { name: "Providers", path: "/admin/providers" },
          { name: "Reports", path: "/admin/reports" },
        ]
      : role === "provider"
        ? [
            { name: "Dashboard", path: "/provider/dashboard" },
            { name: "Services", path: "/provider/services" },
            { name: "Bookings", path: "/provider/bookings" },
            { name: "Profile", path: "/provider/profile" },
          ]
        : [
            { name: "Dashboard", path: "/user/dashboard" },
            { name: "Services", path: "/user/services" },
            { name: "Bookings", path: "/user/bookings" },
            { name: "Profile", path: "/user/profile" },
          ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo-removebg-preview.png"
            alt="Logo"
            width={90}
            height={40}
          />
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`
                relative font-medium transition duration-300
                text-gray-700 hover:text-blue-600
                after:content-[''] after:absolute after:left-0 after:-bottom-1
                after:h-[2px] after:w-0 after:bg-blue-600
                after:transition-all after:duration-300
                hover:after:w-full
                ${isActive(link.path) ? "text-blue-600 after:w-full" : ""}
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3 space-x-4">
          {!session ? (
            <>
              {/* Guest */}

              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-blue-600 transition"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Provider */}
              {user.role === "provider" && (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-gray-600 hover:text-blue-600"
                  >
                    Log in
                  </Link>

                  <Link
                    href="/provider/services/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                  >
                    + Add Service
                  </Link>
                </>
              )}

              {/* Admin */}
              {session.user?.role === "admin" && (
                <span className="text-sm text-gray-500">Admin Panel</span>
              )}

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm bg-red-500 hover:bg-red-700 px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-2xl text-gray-700 cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300  border-t bg-white 
          ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-6 py-5 space-y-4 flex flex-col">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`
        w-full block font-medium transition 
        text-gray-700 hover:text-blue-600
        hover:underline underline-offset-4 decoration-2 decoration-blue-600
        ${isActive(link.path) ? "text-blue-600 underline underline-offset-4 decoration-blue-600" : ""}
      `}
            >
              {link.name}
            </Link>
          ))}

          <div className="border-t pt-4 space-y-3">
            {!session ? (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-blue-600 font-semibold block"
                >
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
        </div>
      </div>
    </header>
  );
}
