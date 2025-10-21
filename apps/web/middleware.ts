import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { User, UserRole } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

// Role to dashboard mapping
const ROLE_DASHBOARDS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.DOCTOR]: '/doctor',
  [UserRole.PATIENT]: '/patient',
  [UserRole.LABORATORY_TECHNICIAN]: '/laboratory-technician',
};

/**
 * Fetch current user from API using cookies
 */
async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Check if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if user can access the current route based on their role
 */
function canAccessRoute(user: User, pathname: string): boolean {
  const userDashboard = ROLE_DASHBOARDS[user.role];
  return pathname.startsWith(userDashboard);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get current user
  const user = await getCurrentUser(request);

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // If user is authenticated and tries to access public route, redirect to dashboard
    if (user) {
      const dashboardUrl = new URL(ROLE_DASHBOARDS[user.role], request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow access to public route
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (user) {
      // Redirect to dashboard
      const dashboardUrl = new URL(ROLE_DASHBOARDS[user.role], request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Protected routes - require authentication
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user has access to the route based on their role
  if (!canAccessRoute(user, pathname)) {
    // Redirect to unauthorized or their dashboard
    const dashboardUrl = new URL(ROLE_DASHBOARDS[user.role], request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
