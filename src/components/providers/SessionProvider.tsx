'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    // Check logout flag on mount and when it changes
    const checkLogoutFlag = () => {
      const logoutFlag = localStorage.getItem('auth-logout-flag');
      const loginFlag = localStorage.getItem('auth-login-flag');
      
      // Only allow refetch if not logged out AND logged in flag is set
      // This prevents refetching in new tabs that haven't established a session yet
      const isLoggedOut = logoutFlag === 'true';
      const isLoggedIn = loginFlag === 'true';
      
      setShouldRefetch(!isLoggedOut && isLoggedIn);
    };

    // Check initially
    checkLogoutFlag();

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-logout-flag' || e.key === 'auth-login-flag') {
        checkLogoutFlag();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={shouldRefetch}
      // Refetch session every 5 minutes to keep it alive
      // Reduced from 3 minutes to minimize network calls
      // Only refetch if not logged out
      refetchInterval={shouldRefetch ? 5 * 60 : 0} // 5 minutes in seconds, or 0 to disable
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
