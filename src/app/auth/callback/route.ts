import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Read token directly from cookies (more reliable than auth() in route handlers)
    const { getToken } = await import('next-auth/jwt');
    
    // Ensure NEXTAUTH_SECRET is set
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('Auth callback: NEXTAUTH_SECRET is not set');
      const loginUrl = new URL('/login?error=config', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Get the origin from the request to construct absolute URLs
    const origin = request.nextUrl.origin;
    
    // Retry logic for production where cookies might take a moment to be available
    // NextAuth v5 uses 'authjs.session-token' or '__Secure-authjs.session-token' cookie names
    let token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If token not found, retry multiple times with increasing delays (for production cookie timing)
    // This handles cases where the cookie is set but not immediately available to the server
    if (!token || !token.id) {
      const maxRetries = 5;
      let retryCount = 0;
      
      while ((!token || !token.id) && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1))); // Increasing delay
        token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
        retryCount++;
      }
    }

    if (!token || !token.id) {
      // Log in both dev and prod for debugging production issues
      // Check what cookies are actually present in the request
      const cookieHeader = request.headers.get('cookie') || '';
      const cookies = cookieHeader.split(';').map(c => c.trim());
      
      console.log('Auth callback: No token found after retry, redirecting to login', {
        hasToken: !!token,
        hasTokenId: token?.id ? true : false,
        tokenKeys: token ? Object.keys(token) : [],
        origin,
        url: request.url,
        cookieCount: cookies.length,
        cookieNames: cookies.map(c => c.split('=')[0]).filter(Boolean),
        hasAuthCookie: cookieHeader.includes('authjs') || cookieHeader.includes('next-auth'),
      });
      const loginUrl = new URL('/login?error=no-token', origin);
      return NextResponse.redirect(loginUrl);
    }

    // Use token role directly (faster than database query)
    // Token role is set during login and is reliable
    const userRole = token.role as UserRole;

    // If role is missing, try to get it from the token or redirect to login
    if (!userRole) {
      console.error('Auth callback: Token missing role', {
        userId: token.id,
        tokenKeys: Object.keys(token),
        origin,
      });
      const loginUrl = new URL('/login?error=no-role', origin);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is admin
    const isAdmin = userRole === UserRole.ADMIN;

    // Log in both dev and prod for debugging production issues (but limit verbosity)
    console.log('Auth callback: Redirecting based on role', {
      userId: token.id,
      userRole,
      isAdmin,
      environment: process.env.NODE_ENV,
      origin,
    });

    // Redirect based on role - use absolute URL
    const redirectPath = isAdmin ? '/admin/dashboard' : '/dashboard';
    const redirectUrl = new URL(redirectPath, origin);
    
    console.log('Auth callback: Redirecting to', redirectUrl.toString());
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    const origin = request.nextUrl.origin;
    const loginUrl = new URL('/login?error=server', origin);
    return NextResponse.redirect(loginUrl);
  }
}

