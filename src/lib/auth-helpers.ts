/**
 * Centralized authentication helper utilities
 * Provides efficient, consistent authentication across API routes
 */

import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
}

/**
 * Get authenticated user from request using JWT token
 * Single efficient call without retries or delays
 */
export async function getAuthenticatedUser(
  request: NextRequest
): Promise<AuthenticatedUser | null> {
  const startTime = Date.now();
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      logger.debug('Auth: No valid token found, trying auth() fallback', {
        hasToken: !!token,
        hasTokenId: !!token?.id,
        duration: Date.now() - startTime,
      });

      try {
        const session = await auth();
        if (session?.user?.id && session?.user?.role) {
          return {
            id: session.user.id as string,
            role: session.user.role as UserRole,
            email: session.user.email ?? undefined,
            name: session.user.name ?? undefined,
          };
        }
      } catch (authError) {
        logger.warn('Auth: auth() fallback failed', {
          error: authError instanceof Error ? authError.message : String(authError),
        });
      }

      return null;
    }

    // OPTIMIZATION: Get role from token - this should ALWAYS be set during login
    // Database query should rarely happen (only for very old legacy tokens)
    let role = token.role as UserRole | undefined;

    if (!role) {
      // Log warning - role should be in token!
      logger.warn('Auth: Role missing from token - this indicates an issue with JWT callback', {
        userId: token.id,
        tokenKeys: Object.keys(token),
        hasRole: !!token.role,
        hasId: !!token.id,
      });

      try {
        const dbStartTime = Date.now();
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, email: true, name: true },
        });

        if (user) {
          role = user.role;
          logger.warn('Auth: Fetched role from database (slow path)', { 
            userId: token.id, 
            role,
            dbDuration: Date.now() - dbStartTime,
            totalDuration: Date.now() - startTime,
          });
        } else {
          logger.warn('Auth: User not found in database', { userId: token.id });
          return null;
        }
      } catch (dbError) {
        logger.error('Auth: Error fetching user from database', dbError);
        return null;
      }
    }

    const result = {
      id: token.id as string,
      role: role!,
      email: token.email as string | undefined,
      name: token.name as string | undefined,
    };

    // Log performance for optimization monitoring
    if (process.env.NODE_ENV === 'development' && Date.now() - startTime > 100) {
      logger.debug('Auth: getAuthenticatedUser took longer than expected', {
        duration: Date.now() - startTime,
        hadDbQuery: !role,
      });
    }

    return result;
  } catch (error) {
    logger.error('Auth: Error getting authenticated user', {
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    });
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRequiredRole(
  user: AuthenticatedUser | null,
  allowedRoles: UserRole[]
): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Require user has specific role - throws if not authorized
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  // This is a server-side function that would need to be adapted
  // For now, we keep it for backward compatibility but it's not used in API routes
  throw new Error('requireRole is deprecated. Use getAuthenticatedUser with hasRequiredRole in API routes.');
}

/**
 * Get user-friendly role name
 */
export function getRoleName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    AGENT: 'Agent',
    WRITER: 'Writer',
  };
  return roleNames[role] || role;
}
