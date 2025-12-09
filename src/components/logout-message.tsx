'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

/**
 * LogoutMessage Component
 * Shows a success message when user is redirected after logout
 * Also clears the logout flag from localStorage
 */
export function LogoutMessage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const logoutParam = searchParams.get('logout');
    
    if (logoutParam === 'success') {
      // Show success message
      toast.success('You\'ve been logged out', 'You have been successfully logged out.');
      
      // Clear logout flag
      localStorage.removeItem('auth-logout-flag');
      
      // Clean up URL by removing query parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('logout');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, toast, router]);

  return null;
}

