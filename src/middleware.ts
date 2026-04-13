import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROLES } from "./constants/roles";

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/services",
  "/providers",
  "/api/auth/login",
  "/api/auth/register",
  "/api/services",
  "/api/providers",
  "/api/categories",
];

/**
 * Role-based route protection
 * Maps routes to required roles
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  "/user/dashboard": [ROLES.USER, ROLES.ADMIN],
  "/user/bookings": [ROLES.USER, ROLES.ADMIN],
  "/user/profile": [ROLES.USER, ROLES.ADMIN],
  "/user/ai-assistant": [ROLES.USER, ROLES.ADMIN],
  "/api/bookings": [ROLES.USER, ROLES.PROVIDER, ROLES.ADMIN],
  "/api/users": [ROLES.ADMIN],
  "/provider/dashboard": [ROLES.PROVIDER, ROLES.ADMIN],
  "/provider/services": [ROLES.PROVIDER, ROLES.ADMIN],
  "/provider/bookings": [ROLES.PROVIDER, ROLES.ADMIN],
  "/provider/profile": [ROLES.PROVIDER, ROLES.ADMIN],
  "/provider/availability": [ROLES.PROVIDER, ROLES.ADMIN],
  "/api/providers": [ROLES.PROVIDER, ROLES.ADMIN],
  "/admin/dashboard": [ROLES.ADMIN],
  "/admin/users": [ROLES.ADMIN],
  "/admin/providers": [ROLES.ADMIN],
  "/admin/services": [ROLES.ADMIN],
  "/admin/categories": [ROLES.ADMIN],
  "/admin/reports": [ROLES.ADMIN],
};

/**
 * Check if a route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Get the required roles for a route
 */
function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles;
    }
  }
  return null;
}

/**
 * Extract and validate token from request
 * Tries to get token from:
 * 1. Authorization header (Bearer token)
 * 2. Cookies (NextAuth session)
 * 3. Query parameters (for development only, should be removed in production)
 */
function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Try NextAuth session cookie
  const sessionCookie = request.cookies.get("next-auth.session-token");
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }

  // Try custom session cookie
  const customSession = request.cookies.get("session");
  if (customSession?.value) {
    return customSession.value;
  }

  return null;
}

/**
 * Decode and validate a simple JWT-like token
 * Note: This is a basic implementation. In production, use proper JWT verification
 * with the secret key stored in environment variables
 */
function decodeToken(
  token: string,
): { userId: string; email: string; role: string } | null {
  try {
    // For development: if token format matches expected structure
    // In production, verify with JWT library (jsonwebtoken)
    const parts = token.split(".");

    // Simple base64 decode for demo (NOT secure for production)
    // Production should use: jwt.verify(token, process.env.JWT_SECRET)
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        return payload;
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Extract user info from request headers
 * Used as fallback when proper JWT setup isn't complete
 */
function getUserInfoFromHeaders(request: NextRequest): {
  userId: string;
  email: string;
  role: string;
} | null {
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const role = request.headers.get("x-user-role");

  if (userId && email && role) {
    return { userId, email, role };
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname);

  // If route is not in protected routes, allow access (could be API routes, etc.)
  if (!requiredRoles) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);

  // No token found - redirect to login for page routes, return 401 for API routes
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode token to get user info
  let userInfo = decodeToken(token);

  // Fallback: try to get user info from headers (for NextAuth or custom implementation)
  if (!userInfo) {
    userInfo = getUserInfoFromHeaders(request);
  }

  // Invalid token
  if (!userInfo || !userInfo.role) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: "INVALID_TOKEN",
        },
        { status: 401 },
      );
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if user has required role
  if (!requiredRoles.includes(userInfo.role)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Insufficient permissions",
          error: "FORBIDDEN",
        },
        { status: 403 },
      );
    }

    // Redirect to appropriate dashboard based on user role
    const dashboardMap: Record<string, string> = {
      [ROLES.USER]: "/user/dashboard",
      [ROLES.PROVIDER]: "/provider/dashboard",
      [ROLES.ADMIN]: "/admin/dashboard",
    };

    const redirectUrl = dashboardMap[userInfo.role] || "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Attach user info to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userInfo.userId);
  requestHeaders.set("x-user-email", userInfo.email);
  requestHeaders.set("x-user-role", userInfo.role);

  // Allow request to proceed with attached user info
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which routes the middleware should run on
 * This is important for performance - don't run middleware on static assets
 */
export const config = {
  matcher: [
    // Run on all routes except:
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
