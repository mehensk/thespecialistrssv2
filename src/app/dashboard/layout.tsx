import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getUserFromToken } from '@/lib/get-user-from-token';

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromToken();

  if (!user?.id) {
    redirect('/');
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

