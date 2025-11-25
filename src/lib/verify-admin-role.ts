import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import { auth } from './auth';
import type { NextRequest } from 'next/server';
import { logger } from './logger';

/**
 * Verifies if the current user has admin role
 * Works in both Server Components and API Routes
 * 
 * @param request - Optional NextRequest for API routes. If not provided, uses Server Component APIs
 */
export async function verifyAdminRole(request?: NextRequest): Promise<{ isAdmin: boolean; userRole: string | null; userId: string | null }> {
  try {
    let token = null;
    
    if (request) {
      // API Route: Use request object directly
      token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      // Fallback to auth() if getToken() fails (more reliable on Netlify)
      if (!token || !token.id) {
        try {
          const session = await auth();
          if (session?.user?.id) {
            token = {
              id: session.user.id,
              role: session.user.role,
            } as any;
          }
        } catch (authError) {
          // auth() also failed
          logger.error('verifyAdminRole: Both getToken and auth() failed in API route', {
            authError: authError instanceof Error ? authError.message : String(authError),
          });
        }
      }
    } else {
      // Server Component: Use cookies() and headers()
      const cookieStore = await cookies();
      const headersList = await headers();
      
      token = await getToken({
        req: {
          cookies: Object.fromEntries(
            cookieStore.getAll().map(c => [c.name, c.value])
          ),
          headers: Object.fromEntries(
            headersList.entries()
          ),
        } as any,
        secret: process.env.NEXTAUTH_SECRET,
      });
      
      // Fallback to auth() if getToken() fails
      if (!token || !token.id) {
        try {
          const session = await auth();
          if (session?.user?.id) {
            token = {
              id: session.user.id,
              role: session.user.role,
            } as any;
          }
        } catch (authError) {
          // auth() also failed
        }
      }
    }
    
    if (!token?.id) {
      return { isAdmin: false, userRole: null, userId: null };
    }

    const userId = token.id as string;
    const tokenRole = token.role as string | null;
    
    // Check token role first (fast path) - if it's ADMIN, trust it
    // OPTIMIZATION: Token role is set during login and is reliable
    // Skip database query for performance - token role is authoritative
    if (tokenRole) {
      const isAdminFromToken = tokenRole === UserRole.ADMIN || tokenRole === 'ADMIN' || tokenRole.toLowerCase() === 'admin';
      if (isAdminFromToken) {
        // Token says admin - trust it (set during login, so it's reliable)
        // Skip DB query for performance - we can verify periodically if needed
        return { isAdmin: true, userRole: tokenRole, userId };
      }
    }
    
    // Token role is not ADMIN or missing - check database to be sure
    // This handles cases where token role is missing or user role changed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      return { isAdmin: false, userRole: null, userId };
    }

    const userRole = user.role;
    const isAdmin = userRole === UserRole.ADMIN;

    return { isAdmin, userRole, userId };
  } catch (error) {
    logger.error('verifyAdminRole error:', error);
    return { isAdmin: false, userRole: null, userId: null };
  }
}

