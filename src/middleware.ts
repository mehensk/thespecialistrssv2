import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown-ip';
}

function logProbe(request: NextRequest, event: 'blocked_wp_admin_probe') {
  console.warn('[SECURITY] Probe blocked', {
    event,
    path: request.nextUrl.pathname,
    ip: getClientIp(request),
    userAgent: request.headers.get('user-agent') || 'unknown-user-agent',
    host: request.headers.get('host') || 'unknown-host',
    timestamp: new Date().toISOString(),
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/wp-admin' || pathname.startsWith('/wp-admin/')) {
    logProbe(request, 'blocked_wp_admin_probe');
    return new NextResponse('Not Found', { status: 404 });
  }

  return NextResponse.next();
}

// Middleware is intentionally limited to trap/telemetry routes.
export const config = {
  matcher: [
    '/wp-admin',
    '/wp-admin/:path*',
  ],
};

