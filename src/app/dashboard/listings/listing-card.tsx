'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { ApproveButton } from './approve-button';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    location: string;
    price: number | null;
    isPublished: boolean;
  };
  isAdmin: boolean;
}

export function ListingCard({ listing, isAdmin }: ListingCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#E5E7EB] overflow-hidden hover:shadow-xl transition-shadow">
      <Link
        href={`/dashboard/listings/${listing.id}/edit`}
        className="block p-6 hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#111111] flex-1">{listing.title}</h3>
          {listing.isPublished ? (
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 ml-2" />
          ) : (
            <Clock size={20} className="text-yellow-600 flex-shrink-0 ml-2" />
          )}
        </div>
        <p className="text-sm text-[#111111]/70 mb-2">{listing.location}</p>
        {listing.price && (
          <p className="text-xl font-semibold text-[#111111] mb-4">
            ₱{listing.price.toLocaleString()}
          </p>
        )}
        <div className="flex items-center gap-2 mb-4">
          {listing.isPublished ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Published
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending Approval
            </span>
          )}
        </div>
      </Link>
      <div className="px-6 pb-6 flex items-center gap-2">
        <Link
          href={`/listings/${listing.id}`}
          className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye size={16} />
        </Link>
        <Link
          href={`/dashboard/listings/${listing.id}/edit`}
          className="p-2 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded-md transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit size={16} />
        </Link>
        {isAdmin && !listing.isPublished && (
          <div onClick={(e) => e.stopPropagation()}>
            <ApproveButton listingId={listing.id} />
          </div>
        )}
        <form action={`/api/listings/${listing.id}/delete`} method="POST" onClick={(e) => e.stopPropagation()}>
          <button
            type="submit"
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

