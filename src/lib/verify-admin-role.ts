import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import { logger } from './logger';

/**
 * Verifies if the current user has admin role
 * Optimized: Skips slow auth() call and uses getToken() directly
 * Uses token role first (fast), then verifies with database if needed
 */
export async function verifyAdminRole(): Promise<{ isAdmin: boolean; userRole: string | null; userId: string | null }> {
  try {
    // Skip auth() - it's slow. Go straight to getToken() which is much faster
    const cookieStore = await cookies();
    const headersList = await headers();
    
    const token = await getToken({
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

