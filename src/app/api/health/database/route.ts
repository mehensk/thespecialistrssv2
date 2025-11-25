import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/prisma';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    return NextResponse.json(health, {
      status: health.healthy ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

