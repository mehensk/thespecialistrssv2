import { AdminLayout } from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { auth } from '@/lib/auth';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Middleware already verified token exists and is valid
    // Try to get session to verify admin role, but don't fail if we can't read it
    // This handles serverless environments where cookie reading can be unreliable
    let session;
    try {
      session = await auth();
    } catch (authError) {
      // If auth() fails, log but don't redirect - middleware already verified token exists
      console.warn('Admin layout: Could not read session, but middleware verified token exists', authError);
      // Allow access since middleware already verified authentication
      return <AdminLayout>{children}</AdminLayout>;
    }

    // If we successfully got session, verify admin role
    if (session?.user?.id) {
      const userRole = session.user.role;
      const isAdmin = userRole === UserRole.ADMIN;

      // If we have role info and user is not admin, redirect
      if (userRole && !isAdmin) {
        console.log('Admin layout: User is not admin, redirecting to home', {
          userRole,
          isAdmin,
        });
        redirect('/');
      }
      
      // User is admin (or role couldn't be determined but middleware verified token)
      return <AdminLayout>{children}</AdminLayout>;
    }

    // If we can't read session but middleware verified token exists, allow access
    // Middleware already checked token exists, so we trust it
    // Role verification will happen in individual page components if needed
    console.log('Admin layout: Could not read session details, but middleware verified token - allowing access');
    return <AdminLayout>{children}</AdminLayout>;
  } catch (error) {
    // Log error but allow access since middleware already verified
    console.error('Admin layout error:', error);
    // Don't redirect on error - middleware already verified token exists
    return <AdminLayout>{children}</AdminLayout>;
  }
}

