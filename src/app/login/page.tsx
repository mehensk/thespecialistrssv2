import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export default async function LoginPage() {
  const headersList = await headers();
  const host = headersList.get('host') || 'unknown-host';
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const userAgent = headersList.get('user-agent') || 'unknown-user-agent';
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown-ip';

  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    console.warn('[SECURITY] Blocked deprecated /login route access', {
      path: '/login',
      host,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  notFound();
}
