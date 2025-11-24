import { getToken } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';

/**
 * Fast way to get user info from JWT token without calling auth()
 * This is much faster than auth() because it just reads the JWT token
 * without going through the full NextAuth session flow
 * 
 * Falls back to auth() if getUserFromToken fails (serverless environments)
 */
export async function getUserFromToken(): Promise<{ id: string; role: UserRole } | null> {
  try {
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

    if (!token || !token.id) {
      // Fallback to auth() if token reading fails (serverless issue)
      try {
        const session = await auth();
        if (session?.user?.id && session?.user?.role) {
          return {
            id: session.user.id,
            role: session.user.role as UserRole,
          };
        }
      } catch (authError) {
        // Both methods failed
        return null;
      }
      return null;
    }

    // Role might not always be set in token (especially in serverless)
    // If role is missing, try to get it from auth() fallback
    if (!token.role) {
      try {
        const session = await auth();
        if (session?.user?.id && session?.user?.role) {
          return {
            id: token.id as string,
            role: session.user.role as UserRole,
          };
        }
      } catch (authError) {
        // Fallback failed, return null
        return null;
      }
      return null;
    }

    return {
      id: token.id as string,
      role: token.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    // Try fallback to auth() on error
    try {
      const session = await auth();
      if (session?.user?.id && session?.user?.role) {
        return {
          id: session.user.id,
          role: session.user.role as UserRole,
        };
      }
    } catch (authError) {
      // Both methods failed
      return null;
    }
    return null;
  }
}

