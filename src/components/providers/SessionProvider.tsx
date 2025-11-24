'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchOnWindowFocus={true}
      // Refetch session every 2 minutes to keep it alive (especially important for Brave browser)
      // This helps prevent session expiration due to cookie blocking or privacy features
      refetchInterval={2 * 60} // 2 minutes in seconds
      // Also refetch when the tab becomes visible again
      refetchWhenOffline={false}
    >
      {children}
    </NextAuthSessionProvider>
  );
}

