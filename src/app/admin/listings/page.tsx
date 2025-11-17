import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { UserRole } from '@prisma/client';
import Link from 'next/link';
import { Check, X, Eye, Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from './approve-button';

export default async function AdminListingsPage() {
    const session = await auth();

  if (!session || session.user.role !== UserRole.ADMIN) {
    redirect('/403');
  }

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
      <h1 className="text-3xl font-semibold text-[#111111] mb-8">Listing Management</h1>

      <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Property ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Creator</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#111111]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 text-sm text-[#111111] font-mono font-semibold">
                    {listing.propertyId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111] font-medium">{listing.title}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{listing.user.name}</td>
                  <td className="px-6 py-4 text-sm text-[#111111]">
                    {listing.price ? `₱${listing.price.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]">{listing.location}</td>
                  <td className="px-6 py-4 text-sm">
                    {listing.isPublished ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111111]/70">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                        target="_blank"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/listings/${listing.id}/edit`}
                        className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                      >
                        <Edit size={16} />
                      </Link>
                      {!listing.isPublished && (
                        <ApproveButton listingId={listing.id} />
                      )}
                      <form action={`/api/admin/listings/${listing.id}/delete`} method="POST">
                        <button
                          type="submit"
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

