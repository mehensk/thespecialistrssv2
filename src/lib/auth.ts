import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma, dbQuery } from './prisma';
import bcrypt from 'bcryptjs';
import { UserRole, ActivityAction, ActivityItemType } from '@prisma/client';
import { logAuthActivity } from './activity-logger';
import { getServerStartTime, hasServerRestarted } from './server-start-time';
import { logger } from './logger';

// Session timeout: 24 hours in seconds (more reasonable for production)
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
// Inactivity timeout: 10 minutes in milliseconds (user inactive for 10 min = logout)
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          logger.debug('Authorize: Missing email or password');
          return null;
        }

        try {
          // Always log in production to debug login issues
          console.log('[AUTH] Attempting login for:', credentials.email);
          logger.debug('Authorize: Attempting to find user', { email: credentials.email });
          
          // Use dbQuery wrapper for automatic retry on connection failures
          // Optimize: Only select fields we need (faster query)
          const user = await dbQuery(() =>
            prisma.user.findUnique({
              where: { email: credentials.email as string },
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true, // Need password for verification
              },
            })
          );

          if (!user) {
            console.log('[AUTH] ❌ User not found:', credentials.email);
            logger.warn('Authorize: User not found', { email: credentials.email });
            return null;
          }

          console.log('[AUTH] ✅ User found:', user.email, 'Role:', user.role);
          logger.debug('Authorize: User found, comparing password', { userId: user.id, email: user.email });
          
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            console.log('[AUTH] ❌ Invalid password for:', credentials.email);
            logger.warn('Authorize: Invalid password', { email: credentials.email });
            return null;
          }

          console.log('[AUTH] ✅ Password valid! Login successful for:', user.email);
          logger.debug('Authorize: Password valid, authentication successful', { userId: user.id });

          // Log login activity asynchronously (non-blocking)
          // This prevents login from being slow due to activity logging
          logAuthActivity(user.id, ActivityAction.LOGIN).catch((error) => {
            // Don't fail auth if logging fails
            logger.error('Failed to log login activity:', error);
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('[AUTH] ❌ Database error during authentication:', error.message);
          console.error('[AUTH] Error stack:', error.stack);
          logger.error('Database error during authentication:', error);
          // Return null to indicate authentication failure
          // The route handler will catch any unhandled errors
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: SESSION_MAX_AGE, // 10 minutes
  },
  callbacks: {
    async jwt({ token, user, trigger }: any) {
      const now = Date.now();
      const serverStartTime = getServerStartTime();

      // On initial login, set timestamps
      if (user) {
        // Only log in development to avoid performance impact
        if (process.env.NODE_ENV === 'development') {
          console.log('=== JWT callback: Initial login ===', {
            userId: user.id,
            userRole: user.role,
          });
        }
        token.id = user.id;
        token.role = user.role;
        token.iat = Math.floor(now / 1000); // Issued at time (seconds)
        token.lastActivity = now; // Last activity time (milliseconds)
        token.serverStartTime = serverStartTime; // Server start time when token was issued
        return token;
      }

      // Check if token exists and has required fields
      // Only id is truly required - other fields can be set if missing
      if (!token.id) {
        // Invalid token structure - force re-authentication
        console.log('=== JWT callback: Token missing id, invalidating ===', {
          tokenKeys: Object.keys(token),
          hasToken: !!token,
        });
        return null;
      }

      // Set missing timestamp fields if they don't exist (for legacy tokens)
      // IMPORTANT: Always set lastActivity if missing to prevent middleware from redirecting
      // This is especially important in serverless environments where tokens might not have this field
      if (!token.lastActivity) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback: Setting missing lastActivity');
        }
        // Set to current time to prevent immediate timeout
        token.lastActivity = now;
      }
      if (!token.serverStartTime) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback: Setting missing serverStartTime');
        }
        token.serverStartTime = getServerStartTime();
      }
      if (!token.iat) {
        if (process.env.NODE_ENV === 'development') {
          console.log('JWT callback: Setting missing iat');
        }
        token.iat = Math.floor(Date.now() / 1000);
      }

      // Always ensure role is set in token - refresh from database if missing
      // OPTIMIZATION: Only query DB if role is actually missing (rare case)
      // Most tokens will have role set during login, so this is fast path
      if (!token.role && token.id) {
        try {
          // Use dbQuery wrapper for automatic retry on connection failures
          // Optimize: Only select role field
          const user = await dbQuery(() =>
            prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true },
            })
          );
          if (user) {
            token.role = user.role;
          } else {
            // User not found, invalidate token
            if (process.env.NODE_ENV === 'development') {
              console.log('JWT callback: User not found, invalidating token', {
                userId: token.id,
              });
            }
            return null;
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching user role in JWT callback:', error);
          }
          // On error, invalidate token to force re-authentication
          return null;
        }
      }

      // Check if server has restarted - if so, invalidate all sessions
      // NOTE: Disabled in production/serverless environments (Netlify, Vercel) because each function
      // invocation can be a new instance, causing false positives and breaking authentication
      // This check is only useful for traditional server deployments
      const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
      if (!isServerless && process.env.NODE_ENV !== 'production' && hasServerRestarted(token.serverStartTime)) {
        // Server has restarted, invalidate this token (dev/test only, not serverless)
        return null;
      }

      // Check inactivity timeout (10 minutes) BEFORE updating
      // Add 5 second tolerance for serverless timing issues
      const timeSinceLastActivity = now - token.lastActivity;
      if (timeSinceLastActivity > (INACTIVITY_TIMEOUT + 5000)) {
        // User has been inactive for more than 10 minutes
        return null;
      }

      // Check session max age (24 hours from token issuance)
      // Add 5 second tolerance for serverless timing issues
      const tokenAge = now - (token.iat * 1000);
      if (tokenAge > (SESSION_MAX_AGE * 1000 + 5000)) {
        // Session has exceeded max age
        return null;
      }

      // Update last activity time on each request
      // Only update if checks passed (user is still active)
      token.lastActivity = now;

      return token;
    },
    async session({ session, token }: any) {
      // If token is null or invalid, return null session
      if (!token || !token.id) {
        return null as any;
      }

      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      } else {
        // Create session user if it doesn't exist
        session = {
          user: {
            id: token.id as string,
            email: '',
            name: '',
            role: token.role as UserRole,
          },
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true, // Required for NextAuth v5 in serverless environments (Netlify, Vercel)
  debug: process.env.NODE_ENV === 'development', // Only debug in development (reduces noise in production)
  // Explicit cookie configuration for Brave browser compatibility
  // Brave's privacy features can block cookies, so we need explicit settings
  cookies: {
    sessionToken: {
      // Only use __Secure- prefix if actually on HTTPS (not localhost)
      name: process.env.NODE_ENV === 'production' && 
            process.env.NEXTAUTH_URL?.startsWith('https://') && 
            !process.env.NEXTAUTH_URL?.includes('localhost')
        ? '__Secure-authjs.session-token' 
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const, // 'lax' is more compatible with Brave than 'strict'
        path: '/',
        // Only use secure cookies if NEXTAUTH_URL is HTTPS AND not localhost
        // Localhost with https:// in NEXTAUTH_URL but actually http:// should not use secure
        secure: (process.env.NEXTAUTH_URL?.startsWith('https://') && 
                !process.env.NEXTAUTH_URL?.includes('localhost')) ?? false,
        // Set maxAge to match session maxAge
        maxAge: SESSION_MAX_AGE,
      },
    },
    callbackUrl: {
      // Only use __Secure- prefix if actually on HTTPS (not localhost)
      name: process.env.NODE_ENV === 'production' && 
            process.env.NEXTAUTH_URL?.startsWith('https://') && 
            !process.env.NEXTAUTH_URL?.includes('localhost')
        ? '__Secure-authjs.callback-url'
        : 'authjs.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: (process.env.NEXTAUTH_URL?.startsWith('https://') && 
                !process.env.NEXTAUTH_URL?.includes('localhost')) ?? false,
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' && 
            process.env.NEXTAUTH_URL?.startsWith('https://') && 
            !process.env.NEXTAUTH_URL?.includes('localhost')
        ? '__Host-authjs.csrf-token'
        : 'authjs.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        // CSRF token must NOT be secure on HTTP localhost
        secure: (process.env.NEXTAUTH_URL?.startsWith('https://') && 
                !process.env.NEXTAUTH_URL?.includes('localhost')) ?? false,
      },
    },
  },
};

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    iat?: number; // Issued at time (seconds)
    lastActivity?: number; // Last activity time (milliseconds)
    serverStartTime?: number; // Server start time when token was issued
  }
}

// Export auth function for NextAuth v5
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Export authOptions for backward compatibility if needed
export { authOptions };
