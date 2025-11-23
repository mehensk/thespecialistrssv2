import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from '@/app/admin/listings/approve-button';

interface Listing {
  id: string;
  propertyId: string | null;
  title: string;
  price: number | null;
  location: string;
  isPublished: boolean;
  createdAt: Date | string;
  user: {
    name: string | null;
    email: string;
  };
}

interface CompactListingCardProps {
  listing: Listing;
}

export function CompactListingCard({ listing }: CompactListingCardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-2.5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-mono font-semibold text-[#111111]/60">
              {listing.propertyId || 'N/A'}
            </span>
            {listing.isPublished ? (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                Pub
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                Pend
              </span>
            )}
          </div>
          <h3 className="text-xs font-semibold text-[#111111] truncate mb-0.5 leading-tight">
            {listing.title}
          </h3>
          <p className="text-[10px] text-[#111111]/70 truncate mb-1">
            {listing.location}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#111111]/60 flex-wrap">
            <span className="truncate">{listing.price ? `₱${listing.price.toLocaleString()}` : 'N/A'}</span>
            <span>•</span>
            <span className="truncate">{listing.user.name || listing.user.email}</span>
            <span>•</span>
            <span>{new Date(listing.createdAt as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link
            href={`/dashboard/listings/${listing.id}/edit`}
            className="p-1 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
            title="Edit"
          >
            <Edit size={12} />
          </Link>
          {!listing.isPublished && (
            <div className="[&_button]:p-1 [&_button_svg]:w-3 [&_button_svg]:h-3">
              <ApproveButton listingId={listing.id} />
            </div>
          )}
          <form action={`/api/admin/listings/${listing.id}/delete`} method="POST">
            <button
              type="submit"
              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

