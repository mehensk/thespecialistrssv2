import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasServerRestarted } from '@/lib/server-start-time';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ['/', '/listings', '/blog', '/contact', '/login', '/api/auth', '/403', '/auth/callback'];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from JWT (optimized - middleware runs on edge, token read is fast)
  // No caching needed here as middleware runs on every request anyway
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to home
  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Check if server has restarted (additional check in middleware)
  if (token.serverStartTime && hasServerRestarted(token.serverStartTime)) {
    // Server has restarted, clear session and redirect to home
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }

  // Check inactivity timeout (10 minutes)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
  if (token.lastActivity) {
    const timeSinceLastActivity = Date.now() - token.lastActivity;
    if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
      // User has been inactive, clear session and redirect to home
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }
  }

  // Admin routes - only ADMIN role allowed
  if (pathname.startsWith('/admin')) {
    // Check if we have a valid token with user ID
    // If token is missing or invalid (no id), redirect to home
    // This handles server restart, logout, and invalid session cases
    if (!token || !token.id) {
      const response = NextResponse.redirect(new URL('/', request.url));
      // Clear any invalid session cookies
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }
    
    // For admin routes, just verify we have a token
    // Let the layout do the actual admin verification with database
    // This is simpler and more reliable since layout runs in Node.js runtime
    return NextResponse.next();
  }

  // Dashboard routes - any authenticated user allowed
  if (pathname.startsWith('/dashboard')) {
    // Token exists and is valid, allow access
  }

  return NextResponse.next();
}

// Optimized matcher - only run middleware on protected routes
// This reduces middleware execution on static assets and public routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ],
};

