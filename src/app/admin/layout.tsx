import { AdminLayout } from '@/components/admin/AdminLayout';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/403');
  }

  return <AdminLayout>{children}</AdminLayout>;
}

