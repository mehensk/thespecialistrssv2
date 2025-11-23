import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { AdminBlogsView } from './blogs-view';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
  // Layout already verifies admin access - no need to check again

  const blogs = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#111111]">Blog Management</h1>
      </div>

      <AdminBlogsView blogs={blogs} />
    </div>
  );
}
