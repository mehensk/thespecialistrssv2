'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useToast } from '@/components/ui/toast';

export function DeleteButton({ blogId, isAdmin }: { blogId: string; isAdmin: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin 
        ? `/api/admin/blogs/${blogId}/delete`
        : `/api/blogs/${blogId}/delete`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error('Delete failed', data.error || 'Failed to delete blog post');
        setLoading(false);
        return;
      }

      toast.success('Blog deleted', 'The blog post has been deleted successfully.');
      router.refresh();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Error', 'An error occurred while deleting the blog post');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete blog post"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={loading}
      />
    </>
  );
}

