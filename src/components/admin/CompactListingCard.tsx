import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ApproveButton } from '@/app/admin/listings/approve-button';
import { useToast } from '@/components/ui/toast';

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
  const router = useRouter();
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Convert createdAt to ISO string for consistent formatting
  const createdAtIso = new Date(listing.createdAt as string).toISOString().split('T')[0];

  const handleDeleteClick = () => {
    const confirmed = window.confirm('Are you sure to delete this listing?');
    if (!confirmed) {
      return;
    }
    void handleDelete();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/listings/${listing.id}/delete`, {
        method: 'POST',
        headers: {
          'x-delete-confirmed': '1',
        },
      });

      if (response.ok) {
        success('Listing deleted successfully');
        router.refresh();
      } else {
        const data = await response.json();
        error(data.error || 'Failed to delete listing');
      }
    } catch (err) {
      error('Failed to delete listing. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 sm:p-2.5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs sm:text-[10px] font-mono font-semibold text-[#111111]/60">
              {listing.propertyId || 'N/A'}
            </span>
            {listing.isPublished ? (
              <span className="px-1.5 py-0.5 rounded-full text-xs sm:text-[10px] font-medium bg-green-100 text-green-800">
                Pub
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full text-xs sm:text-[10px] font-medium bg-yellow-100 text-yellow-800">
                Pend
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-xs font-semibold text-[#111111] truncate mb-0.5 leading-tight">
            {listing.title}
          </h3>
          <p className="text-xs sm:text-[10px] text-[#111111]/70 truncate mb-1">
            {listing.location}
          </p>
          <div className="flex items-center gap-2 text-xs sm:text-[10px] text-[#111111]/60 flex-wrap">
            <span className="truncate">{listing.price ? `₱${listing.price.toLocaleString()}` : 'N/A'}</span>
            <span>•</span>
            <span className="truncate">{listing.user.name || listing.user.email}</span>
            <span>•</span>
            <span>{createdAtIso}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Link
            href={`/dashboard/listings/${listing.id}/edit`}
            className="p-1.5 sm:p-1 text-[#111111]/70 hover:text-[#111111] hover:bg-[#F9FAFB] rounded transition-colors"
            title="Edit"
          >
            <Edit size={12} />
          </Link>
          {!listing.isPublished && (
            <div className="[&_button]:p-1.5 sm:[&_button]:p-1 [&_button_svg]:w-3 [&_button_svg]:h-3">
              <ApproveButton listingId={listing.id} />
            </div>
          )}
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-1.5 sm:p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
