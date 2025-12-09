import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasServerRestarted } from '@/lib/server-start-time';

// Session timeout constants (must match auth.ts)
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Validate token similar to JWT callback
 * Returns true if token is valid, false if it should be invalidated
 */
function validateToken(token: any): boolean {
  if (!token || !token.id) {
    return false;
  }

  const now = Date.now();

  // Check inactivity timeout (10 minutes)
  if (token.lastActivity) {
    const timeSinceLastActivity = now - token.lastActivity;
    if (timeSinceLastActivity > (INACTIVITY_TIMEOUT + 5000)) {
      return false;
    }
  }

  // Check session max age (24 hours from token issuance)
  if (token.iat) {
    const tokenAge = now - (token.iat * 1000);
    if (tokenAge > (SESSION_MAX_AGE * 1000 + 5000)) {
      return false;
    }
  }

  // Check if server has restarted (dev/test only, not serverless)
  const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (!isServerless && process.env.NODE_ENV !== 'production' && token.serverStartTime && hasServerRestarted(token.serverStartTime)) {
    return false;
  }

  return true;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require auth
  const publicRoutes = ['/', '/listings', '/blog', '/contact', '/login', '/api/auth', '/403', '/auth/callback'];
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from JWT (optimized - middleware runs on edge, token read is fast)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, redirect to home for protected routes
  if (!token) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Validate token (check if JWT callback would return null)
  // This ensures we catch expired/invalid tokens before they reach layouts
  if (!validateToken(token)) {
    // Token is invalid (expired, inactive, etc.), clear cookies and redirect
    const response = NextResponse.redirect(new URL('/', request.url));
    // Clear all auth cookies
    response.cookies.delete('authjs.session-token');
    response.cookies.delete('__Secure-authjs.session-token');
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }

  // Admin routes - only ADMIN role allowed
  if (pathname.startsWith('/admin')) {
    // Token is valid, allow access
    // Role verification happens in layout
    return NextResponse.next();
  }

  // Dashboard routes - any authenticated user allowed
  if (pathname.startsWith('/dashboard')) {
    // Token is valid, allow access
    return NextResponse.next();
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

