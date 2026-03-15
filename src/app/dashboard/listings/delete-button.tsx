'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/components/ui/toast';

export function DeleteButton({ listingId, title }: { listingId: string; title: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(`Are you sure to delete this listing: "${title}"?`);
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/listings/${listingId}/delete`, {
        method: 'POST',
        headers: {
          'x-delete-confirmed': '1',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error('Delete failed', data.error || 'Failed to delete listing');
        setLoading(false);
        return;
      }

      toast.success('Listing deleted', 'The listing has been deleted successfully.');
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Error', 'An error occurred while deleting the listing');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          void handleDelete();
        }}
        disabled={loading}
        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete listing"
      >
        <Trash2 size={16} />
      </button>
    </>
  );
}
