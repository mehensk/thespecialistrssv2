import { AdminLayout } from '@/components/admin/AdminLayout';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { getUserFromToken } from '@/lib/get-user-from-token';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromToken();

  if (!user?.id || user.role !== UserRole.ADMIN) {
    redirect('/');
  }

  return <AdminLayout>{children}</AdminLayout>;
}

