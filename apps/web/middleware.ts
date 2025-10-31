import { decrypt } from "@/app/lib/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// 1. Specify protected and public route prefixes
const protectedRoutes = ["/patient", "/doctor", "/logout"];
const publicRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.sub) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 5. Role-based route protection for prefixes
  if (
    req.nextUrl.pathname.startsWith("/doctor") &&
    session?.role !== "doctor"
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (
    req.nextUrl.pathname.startsWith("/patient") &&
    session?.role !== "patient"
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 6. Redirect authenticated users away from public routes to their home
  if (isPublicRoute && session?.sub) {
    if (session.role === "doctor") {
      return NextResponse.redirect(new URL("/doctor", req.nextUrl));
    }
    if (session.role === "patient") {
      return NextResponse.redirect(new URL("/patient", req.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
