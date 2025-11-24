import { getToken } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import { UserRole } from '@prisma/client';

/**
 * Fast way to get user info from JWT token without calling auth()
 * This is much faster than auth() because it just reads the JWT token
 * without going through the full NextAuth session flow
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
      return null;
    }

    // Role might not always be set in token (especially in serverless)
    // If role is missing, return null so calling code can fall back to auth()
    // This is safer than guessing the role
    if (!token.role) {
      return null;
    }

    return {
      id: token.id as string,
      role: token.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

