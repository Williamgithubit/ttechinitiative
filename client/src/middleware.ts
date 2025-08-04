import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Define protected routes and their allowed roles
  const protectedRoutes = {
    '/protected/admin': ['admin'],
    '/protected/teacher': ['teacher'],
    '/protected/student': ['student'],
    '/protected/parent': ['parent'],
    '/api/admin': ['admin'], // Protect all admin API routes
  };

  // Check if the current path is protected
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  // If the route is protected and user is not authenticated, redirect to login
  if (matchedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the route is protected and user is authenticated but doesn't have the right role
  if (matchedRoute && token) {
    const allowedRoles = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];
    const userRole = token.role || 'unauthorized';
    if (!allowedRoles.includes(userRole)) {
      // Redirect to unauthorized or a default dashboard based on role
      const defaultRole = token.role || 'unauthorized'; // Provide a default role if undefined
      const defaultRoute = `/${defaultRole}`;
      return NextResponse.redirect(new URL(defaultRoute, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/protected/admin/:path*',
    '/protected/teacher/:path*',
    '/protected/student/:path*',
    '/protected/parent/:path*',
    '/dashboard/:path*',
    '/profile',
    '/settings',
    '/api/admin/:path*', // Include admin API routes in the matcher
  ],
};
