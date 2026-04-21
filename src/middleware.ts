import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;
  const protectedRoutes = [
    "/user",
    "/providers/dashboard",
    "/admin",
    "/bookings",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  if (!isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (
    pathname.startsWith("/providers/dashboard") &&
    token?.role !== "provider"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/user/:path*",
    "/providers/:path*",
    "/admin/:path*",
    "/bookings/:path*",
  ],
};
