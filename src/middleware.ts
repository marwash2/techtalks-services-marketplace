import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // public routes
  if (
    pathname.startsWith("/register") ||
    pathname.startsWith("/login") ||
    pathname === "/" ||
    pathname.startsWith("/providers") ||
    pathname.startsWith("/services")
  ) {
    return NextResponse.next();
  }
  // If no token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }
  //Default
  return NextResponse.next();
}
// Apply middleware to protected routes
export const config = {
  matcher: [
    "/user/dashboard/:path*",
    //"/providers/:path*",
    "/admin/:path*",
    "/bookings/:path*",
   // "/services/:path*",
  ],
};
