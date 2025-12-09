import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { logger } from '@/lib/logger';

/**
 * Server-side logout endpoint
 * Properly clears HttpOnly cookies that can't be cleared from client-side
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated (optional check)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Create response
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear all auth cookies server-side
    // NextAuth v5 uses authjs.session-token
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && 
              process.env.NEXTAUTH_URL?.startsWith('https://') && 
              !process.env.NEXTAUTH_URL?.includes('localhost'),
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    };

    // Clear all possible cookie names
    response.cookies.set('authjs.session-token', '', cookieOptions);
    response.cookies.set('__Secure-authjs.session-token', '', {
      ...cookieOptions,
      secure: true,
    });
    response.cookies.set('authjs.callback-url', '', cookieOptions);
    response.cookies.set('__Secure-authjs.callback-url', '', {
      ...cookieOptions,
      secure: true,
    });
    response.cookies.set('authjs.csrf-token', '', cookieOptions);
    response.cookies.set('__Host-authjs.csrf-token', '', {
      ...cookieOptions,
      secure: true,
    });
    
    // Also clear old cookie names for backward compatibility
    response.cookies.set('next-auth.session-token', '', cookieOptions);
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true,
    });

    if (token?.id) {
      logger.debug('User logged out', { userId: token.id });
    }

    return response;
  } catch (error) {
    logger.error('Logout endpoint error:', error);
    
    // Even on error, try to clear cookies
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' && 
              process.env.NEXTAUTH_URL?.startsWith('https://') && 
              !process.env.NEXTAUTH_URL?.includes('localhost'),
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };

    // Clear cookies even on error
    response.cookies.set('authjs.session-token', '', cookieOptions);
    response.cookies.set('__Secure-authjs.session-token', '', {
      ...cookieOptions,
      secure: true,
    });
    response.cookies.set('next-auth.session-token', '', cookieOptions);
    response.cookies.set('__Secure-next-auth.session-token', '', {
      ...cookieOptions,
      secure: true,
    });

    return response;
  }
}

