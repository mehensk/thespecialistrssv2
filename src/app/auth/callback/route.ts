import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Read token directly from cookies (more reliable than auth() in route handlers)
    const { getToken } = await import('next-auth/jwt');
    
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      console.log('Auth callback: No token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Use token role directly (faster than database query)
    // Token role is set during login and is reliable
    const userRole = token.role as UserRole;

    // Check if user is admin (handle both enum and string comparisons)
    const isAdmin = userRole && (
      userRole === UserRole.ADMIN || 
      userRole === 'ADMIN' || 
      userRole.toLowerCase() === 'admin'
    );

    // Only log in development to avoid performance impact
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth callback: Redirecting based on role', {
        userId: token.id,
        userRole,
        isAdmin,
      });
    }

    // Redirect based on role
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

