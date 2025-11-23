'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * LogoutSync Component
 * Synchronizes logout across all browser tabs/windows
 * When user logs out in one tab, all other tabs will also log out
 */
export function LogoutSync() {
  const { data: session } = useSession();

  useEffect(() => {
    // Use BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('auth-sync');

    // Listen for logout events from other tabs
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'LOGOUT') {
        // Another tab logged out, log out this tab too
        if (session) {
          try {
            // Sign out - this clears the session cookie
            await signOut({ 
              redirect: true,
              callbackUrl: '/'
            });
          } catch (error) {
            console.error('Logout sync error:', error);
            // Fallback: force redirect
            window.location.href = '/';
          }
        }
      }
    };

    channel.addEventListener('message', handleMessage);

    // Also listen for storage events (fallback for older browsers)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'auth-logout' && e.newValue === 'true') {
        if (session) {
          try {
            // Sign out - this clears the session cookie
            await signOut({ 
              redirect: true,
              callbackUrl: '/'
            });
            // Clear the flag
            localStorage.removeItem('auth-logout');
          } catch (error) {
            console.error('Logout sync error:', error);
            // Clear the flag
            localStorage.removeItem('auth-logout');
            // Fallback: force redirect
            window.location.href = '/';
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      channel.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
      channel.close();
    };
  }, [session]);

  // This component doesn't render anything
  return null;
}

/**
 * Broadcast logout to all tabs
 * Call this function when user logs out
 */
export function broadcastLogout() {
  // Use BroadcastChannel
  const channel = new BroadcastChannel('auth-sync');
  channel.postMessage({ type: 'LOGOUT' });
  channel.close();

  // Also use localStorage as fallback
  localStorage.setItem('auth-logout', 'true');
  // Remove it after a short delay
  setTimeout(() => {
    localStorage.removeItem('auth-logout');
  }, 1000);
}

