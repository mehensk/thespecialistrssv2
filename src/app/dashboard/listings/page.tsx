import { getUserFromToken } from '@/lib/get-user-from-token';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';
import { ListingCard } from './listing-card';

// Fast user ID retrieval from JWT token (much faster than auth())
async function getListings(userId: string) {
  return prisma.listing.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      location: true,
      price: true,
      isPublished: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

async function ListingsContent() {
  const user = await getUserFromToken();
  const session = await auth();
  const isAdmin = session?.user?.role === UserRole.ADMIN;
  
  if (!user?.id) {
    return null;
  }

  const listings = await getListings(user.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-[#111111]">My Listings</h1>
        <Link
          href="/dashboard/listings/new"
          className="bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#111111]/70 mb-6">You haven't created any listings yet.</p>
          <Link
            href="/dashboard/listings/new"
            className="inline-block bg-gradient-to-r from-[#1F2937] to-[#111111] text-white px-6 py-3 rounded-md hover:from-[#1A232E] hover:to-[#0F1419] transition-all duration-300 font-medium"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DashboardListingsPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 bg-gray-200 rounded w-48"></div>
          <div className="h-12 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

