import { handlers } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Ensure NEXTAUTH_SECRET is set
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set in environment variables');
}

// Wrap handlers with error handling to ensure JSON responses
export async function GET(request: NextRequest) {
  try {
    const response = await handlers.GET(request);
    // Ensure we have a valid response
    if (!response) {
      return NextResponse.json(
        { error: 'No response from authentication handler' },
        { status: 500 }
      );
    }
    return response;
  } catch (error: any) {
    console.error('NextAuth GET error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = await handlers.POST(request);
    // Ensure we have a valid response
    if (!response) {
      return NextResponse.json(
        { error: 'No response from authentication handler' },
        { status: 500 }
      );
    }
    return response;
  } catch (error: any) {
    console.error('NextAuth POST error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
