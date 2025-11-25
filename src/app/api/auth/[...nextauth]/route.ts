import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Check NEXTAUTH_SECRET - only throw at runtime, not during build
// This allows the build to complete even if the secret isn't set in Netlify build env
const checkAuthSecret = () => {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables');
  }
};

// Wrap handlers with error handling to ensure JSON responses
export async function GET(request: NextRequest) {
  try {
    checkAuthSecret();
    
    // Log environment check for debugging
    if (process.env.NODE_ENV === 'development') {
      logger.debug('NextAuth GET - Environment check:', {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
      });
    }
    
    const response = await handlers.GET(request);
    // Ensure we have a valid response
    if (!response) {
      logger.error('NextAuth GET - No response from handler');
      return NextResponse.json(
        { error: 'No response from authentication handler' },
        { status: 500 }
      );
    }
    return response;
  } catch (error: any) {
    logger.error('NextAuth GET error:', error);
    logger.error('Error stack:', error?.stack);
    console.error('NextAuth GET error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: error?.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    checkAuthSecret();
    
    // Log POST request for debugging
    console.log('[NextAuth POST] Handling authentication request');
    const url = request.nextUrl.toString();
    console.log('[NextAuth POST] URL:', url);
    
    const response = await handlers.POST(request);
    
    // Log response status
    if (response) {
      console.log('[NextAuth POST] Response status:', response.status);
      console.log('[NextAuth POST] Response headers:', Object.fromEntries(response.headers.entries()));
    } else {
      console.error('[NextAuth POST] No response from handler');
    }
    
    // Ensure we have a valid response
    if (!response) {
      return NextResponse.json(
        { error: 'No response from authentication handler' },
        { status: 500 }
      );
    }
    return response;
  } catch (error: any) {
    console.error('[NextAuth POST] Error:', error);
    console.error('[NextAuth POST] Error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
    });
    logger.error('NextAuth POST error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
