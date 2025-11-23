'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function ApproveButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Listing approved', 'The listing has been published successfully.');
        router.refresh();
      } else {
        const data = await response.json();
        toast.error('Approval failed', data.error || 'Failed to approve listing');
      }
    } catch (error) {
      console.error('Error approving listing:', error);
      toast.error('Error', 'An error occurred while approving the listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title="Approve"
    >
      <Check size={16} />
    </button>
  );
}

