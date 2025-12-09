'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    // Check logout flag on mount and when it changes
    const checkLogoutFlag = () => {
      const logoutFlag = localStorage.getItem('auth-logout-flag');
      setShouldRefetch(!logoutFlag);
    };

    // Check initially
    checkLogoutFlag();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-logout-flag') {
        checkLogoutFlag();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case flag was set in same tab
    const interval = setInterval(checkLogoutFlag, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={shouldRefetch}
      // Refetch session every 3 minutes to keep it alive (especially important for Brave browser)
      // Increased from 2 minutes to reduce interference with form input
      // This helps prevent session expiration due to cookie blocking or privacy features
      // Only refetch if not logged out
      refetchInterval={shouldRefetch ? 3 * 60 : 0} // 3 minutes in seconds, or 0 to disable
      // Also refetch when the tab becomes visible again
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}

