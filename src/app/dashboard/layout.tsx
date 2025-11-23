import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { getUserFromToken } from '@/lib/get-user-from-token';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

// Additional auth check in layout as a safety net
// Middleware handles most cases, but this ensures we redirect if token is invalid
// IMPORTANT: Admins should use the unified admin panel layout, not the regular dashboard layout
export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromToken();
  
  // If user is not authenticated, redirect to home
  if (!user?.id) {
    redirect('/');
  }
  
  // If user is admin, use AdminLayout to maintain consistent sidebar
  // This ensures admins always see the unified admin panel navigation
  // even when accessing /dashboard/listings, /dashboard/blogs, /dashboard/settings
  if (user.role === UserRole.ADMIN) {
    return <AdminLayout>{children}</AdminLayout>;
  }
  
  // Non-admin users use the regular dashboard layout
  return <DashboardLayout>{children}</DashboardLayout>;
}

