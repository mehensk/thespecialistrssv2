import { AdminLayout } from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Optimized: Middleware already verified token exists and is valid
  // We can trust the token exists, but we still need to verify admin role
  // This is faster than calling getUserFromToken() which does the same thing
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

  // If no token or no user ID, redirect to home
  // (This should rarely happen as middleware already checked, but safety net)
  if (!token?.id) {
    redirect('/');
  }

  // Check token role directly (fast - no DB query, just JWT decode)
  // Middleware already verified token exists, so we just need to check role
  const tokenRole = token.role as string | null;
  const isAdmin = tokenRole && (
    tokenRole === UserRole.ADMIN || 
    tokenRole === 'ADMIN' || 
    tokenRole.toLowerCase() === 'admin'
  );

  // If not admin, redirect to home
  if (!isAdmin) {
    redirect('/');
  }
  
  // Middleware already verified token exists and is valid
  // Layout just needs to verify admin role (already done above)
  // Pages that need userId will call getUserFromToken() which is fast (just reads JWT, no DB)
  return <AdminLayout>{children}</AdminLayout>;
}

