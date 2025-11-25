'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCircle } from 'lucide-react';

export function ApproveButton({ blogId }: { blogId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch(`/api/admin/blogs/${blogId}/approve`, {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent (important for Netlify)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Refresh the page after a short delay to show success message
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(data.error || 'Failed to approve blog post');
      }
    } catch (error) {
      console.error('Error approving blog:', error);
      setError('An error occurred while approving the blog post');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={16} />
        <span className="text-xs font-medium">Approved!</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Approve"
      >
        <Check size={16} />
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
}

