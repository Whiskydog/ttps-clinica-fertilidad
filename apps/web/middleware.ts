import { decrypt } from "@/app/lib/session";
import { RoleCode } from "@repo/contracts";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Role to dashboard mapping
const roleDashboards: Record<string, string> = {
  [RoleCode.PATIENT]: "/patient",
  [RoleCode.ADMIN]: "/admin",
  [RoleCode.DOCTOR]: "/doctor",
  [RoleCode.DIRECTOR]: "/medical-director",
  [RoleCode.LAB_TECHNICIAN]: "/laboratory-technician",
};

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/staff-login", "/"];

// Protected route prefixes
const protectedPrefixes = [
  "/patient",
  "/admin",
  "/doctor",
  "/medical-director",
  "/laboratory-technician",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // Check if current path is protected
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    path.startsWith(prefix)
  );

  // Check if current path is public
  const isPublicRoute = publicRoutes.includes(path);

  // If accessing a protected route without authentication
  if (isProtectedRoute && !session?.sub) {
    // Redirect staff routes to staff login, patient routes to patient login
    if (path.startsWith("/patient")) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    return NextResponse.redirect(new URL("/staff-login", req.nextUrl));
  }

  // If user is authenticated
  if (session?.sub && session?.role) {
    const userRole = session.role;
    const userDashboard = roleDashboards[userRole];

    // If trying to access a login page while authenticated
    if (path === "/login" || path === "/staff-login") {
      return NextResponse.redirect(new URL(userDashboard, req.nextUrl));
    }

    // If trying to access a protected route that doesn't match their role
    if (isProtectedRoute) {
      const hasAccess = path.startsWith(userDashboard);
      if (!hasAccess) {
        // Redirect to their correct dashboard
        return NextResponse.redirect(new URL(userDashboard, req.nextUrl));
      }
    }
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
