"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell } from "lucide-react";
import { useSidebar } from "@/components/layout/SidebarContext";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const { toggle } = useSidebar();

  const user = session?.user;
  const role = user?.role;

  const isActive = (path: string) => pathname === path;

  // Links for guest / admin (no sidebar)
  const navLinks = !session
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
      : [];

  const hasSidebar = role === "user" || role === "provider";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
<div className="flex items-center gap-3">
  
  {/* HAMBURGER (only for sidebar users) */}
  {hasSidebar && (
    <button
      onClick={toggle}
      className="lg:hidden p-2 text-gray-700 bg-white rounded-md shadow cursor-pointer"
      aria-label="Toggle sidebar"
    >
      ☰
    </button>
  )}

  {/* Notification bell */}
  {session && (
    <Link
      href="/notifications"
      className="relative p-2 text-gray-600 hover:text-blue-600 transition"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
    </Link>
  )}

  {/* LOGO */}
  {hasSidebar ? (
    <button
      onClick={toggle}
      className="flex items-center cursor-pointer"
      aria-label="Toggle sidebar"
    >
      <img
        src="/logo-removebg-preview.png"
        alt="Logo"
        width={50}
        height={30}
      />
    </button>
  ) : (
    <Link href="/" className="flex items-center">
      <img
        src="/logo-removebg-preview.png"
        alt="Logo"
        width={50}
        height={30}
      />
    </Link>
  )}
</div>

        {/* DESKTOP NAV: only for guest / admin */}
        {navLinks.length > 0 && (
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => (
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
        )}

        {/* Placeholder for layout balance when sidebar role has no center nav */}
        {hasSidebar && <div className="hidden md:block flex-1" />}

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3 space-x-4">
          {!session ? (
            <>
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
              {user?.role === "provider" && (
                <Link
                  href="/provider/services/new"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
                >
                  + Add Service
                </Link>
              )}

              {user?.role === "admin" && (
                <span className="text-sm text-gray-500">Admin Panel</span>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON: only for guest / admin */}
        {!hasSidebar && (
          <button
            className="md:hidden text-2xl text-gray-700 cursor-pointer"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}

        {/* Mobile placeholder when sidebar role */}
        {hasSidebar && <div className="md:hidden w-8" />}
      </div>

      {/* MOBILE MENU: only for guest / admin */}
      {!hasSidebar && (
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 border-t bg-white 
            ${menuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="px-6 py-5 space-y-4 flex flex-col">
            {navLinks.map((link) => (
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
      )}
    </header>
  );
}
