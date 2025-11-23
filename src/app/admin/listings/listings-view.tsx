'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from './approve-button';
import { ViewToggle } from '@/components/admin/ViewToggle';
import { CompactListingCard } from '@/components/admin/CompactListingCard';
import { SearchInput } from '@/components/ui/search-input';

interface Listing {
  id: string;
  propertyId: string | null;
  title: string;
  price: number | null;
  listingType: string | null;
  location: string;
  isPublished: boolean;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
}

interface AdminListingsViewProps {
  listings: Listing[];
}

export function AdminListingsView({ listings }: AdminListingsViewProps) {
  const [view, setView] = useState<'grid' | 'compact'>('compact');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = useMemo(() => {
    if (!searchQuery.trim()) {
      return listings;
    }

    const query = searchQuery.toLowerCase();
    return listings.filter((listing) => {
      const searchableText = [
        listing.title,
        listing.propertyId,
        listing.location,
        listing.user.name,
        listing.user.email,
        listing.price?.toString(),
        listing.listingType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [listings, searchQuery]);

  if (!listings || listings.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4 z-10 relative">
          <div className="text-sm text-[#111111]/60">View: {view === 'compact' ? 'Table' : 'Grid'}</div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#111111]/70">No listings found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-4 z-10 relative">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search listings by title, ID, location, creator..."
          />
        </div>
        <div className="flex items-center gap-4">
          {searchQuery && (
            <div className="text-sm text-[#111111]/60">
              {filteredListings.length} of {listings.length} listings
            </div>
          )}
          <div className="text-sm text-[#111111]/60">View: {view === 'compact' ? 'Table' : 'Grid'}</div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-12 text-center">
          <p className="text-[#111111]/70">
            {searchQuery ? 'No listings match your search.' : 'No listings found.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm text-[#1F2937] hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : view === 'compact' ? (
        <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Property ID</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Title</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Creator</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Location</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-[#111111]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#F9FAFB]">
                    <td className="px-4 py-2 text-xs text-[#111111] font-mono font-semibold">
                      {listing.propertyId || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#111111] font-medium max-w-xs truncate">{listing.title}</td>
                    <td className="px-4 py-2 text-xs text-[#111111]">{listing.user.name || listing.user.email}</td>
                    <td className="px-4 py-2 text-xs text-[#111111]">
                      {listing.price ? `₱${listing.price.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {listing.listingType ? (
                        listing.listingType.toLowerCase() === 'rent' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Rent
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Sale
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#111111] max-w-xs truncate">{listing.location}</td>
                    <td className="px-4 py-2 text-xs">
                      {listing.isPublished ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#111111]/70">
                      {new Date(listing.createdAt as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/dashboard/listings/${listing.id}/edit`}
                          className="p-1.5 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        {!listing.isPublished && (
                          <div className="[&_button]:p-1.5 [&_button_svg]:w-3.5 [&_button_svg]:h-3.5">
                            <ApproveButton listingId={listing.id} />
                          </div>
                        )}
                        <form action={`/api/admin/listings/${listing.id}/delete`} method="POST">
                          <button
                            type="submit"
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredListings.map((listing) => (
            <CompactListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

