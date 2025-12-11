'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    // Check logout flag on mount and when it changes
    const checkLogoutFlag = () => {
      const logoutFlag = localStorage.getItem('auth-logout-flag');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b5ded69-e2d1-428f-b70f-1a87e140a928',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:13',message:'checkLogoutFlag called',data:{logoutFlag,shouldRefetch:!logoutFlag},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2'})}).catch(()=>{});
      // #endregion
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

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/3b5ded69-e2d1-428f-b70f-1a87e140a928',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SessionProvider.tsx:37',message:'SessionProvider render with refetch config',data:{shouldRefetch,refetchInterval:shouldRefetch?3*60:0,refetchOnWindowFocus:shouldRefetch},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1,H2'})}).catch(()=>{});
  }, [shouldRefetch]);
  // #endregion

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

