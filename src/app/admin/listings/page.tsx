import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';
import { AdminListingsView } from './listings-view';

export default async function AdminListingsPage() {
  // Layout already verifies admin access - no need to check again

  const listings = await prisma.listing.findMany({
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
        <h1 className="text-3xl font-semibold text-[#111111]">Listing Management</h1>
      </div>

      <AdminListingsView listings={listings} />
    </div>
  );
}
