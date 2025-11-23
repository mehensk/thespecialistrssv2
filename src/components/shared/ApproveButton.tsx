'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { logger } from '@/lib/logger';

interface ApproveButtonProps {
  itemId: string;
  itemType: 'listing' | 'blog';
}

export function ApproveButton({ itemId, itemType }: ApproveButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const endpoint = `/api/admin/${itemType === 'listing' ? 'listings' : 'blogs'}/${itemId}/approve`;
      const response = await fetch(endpoint, {
        method: 'POST',
      });

      if (response.ok) {
        const itemName = itemType === 'listing' ? 'Listing' : 'Blog post';
        toast.success(
          `${itemName} approved`,
          `The ${itemType} has been published successfully.`
        );
        router.refresh();
      } else {
        const data = await response.json();
        toast.error('Approval failed', data.error || `Failed to approve ${itemType}`);
      }
    } catch (error) {
      logger.error(`Error approving ${itemType}:`, error);
      toast.error('Error', `An error occurred while approving the ${itemType}`);
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
      aria-label={`Approve ${itemType}`}
    >
      <Check size={16} />
    </button>
  );
}

