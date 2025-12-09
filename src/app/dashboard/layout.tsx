import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

// Hybrid approach: Allow access if middleware passed, but redirect if session is explicitly null
// IMPORTANT: Admins should use the unified admin panel layout, not the regular dashboard layout
export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Middleware already verified token exists and is valid
    // Try to get session to verify user
    let session;
    try {
      session = await auth();
    } catch (authError) {
      // If auth() fails, it might be a serverless issue, but if middleware passed, allow access
      console.warn('Dashboard layout: Could not read session, but middleware verified token exists', authError);
      // Allow access since middleware already verified authentication
      // Default to DashboardLayout if we can't determine role
      return <DashboardLayout>{children}</DashboardLayout>;
    }

    // Hybrid approach: If session is explicitly null (not just undefined), redirect
    // This handles cases where JWT callback returned null (expired, inactive, etc.)
    if (session === null) {
      // Session is explicitly null, redirect to home
      redirect('/');
    }

    // If we successfully got session, check user
    if (session?.user?.id) {
      const userRole = session.user.role as UserRole | string | undefined;
      const isAdmin = userRole && (
        userRole === UserRole.ADMIN || 
        userRole === 'ADMIN' || 
        (typeof userRole === 'string' && userRole.toLowerCase() === 'admin')
      );

      // If user is admin, use AdminLayout to maintain consistent sidebar
      // This ensures admins always see the unified admin panel navigation
      // even when accessing /dashboard/listings, /dashboard/blogs, /dashboard/settings
      if (isAdmin) {
        return <AdminLayout>{children}</AdminLayout>;
      }
      
      // Non-admin users use the regular dashboard layout
      return <DashboardLayout>{children}</DashboardLayout>;
    }

    // If we can't read session but middleware verified token exists, allow access
    // Middleware already checked token exists, so we trust it
    console.log('Dashboard layout: Could not read session details, but middleware verified token - allowing access');
    return <DashboardLayout>{children}</DashboardLayout>;
  } catch (error) {
    // Log error but allow access since middleware already verified
    console.error('Dashboard layout error:', error);
    // Don't redirect on error - middleware already verified token exists
    return <DashboardLayout>{children}</DashboardLayout>;
  }
}

