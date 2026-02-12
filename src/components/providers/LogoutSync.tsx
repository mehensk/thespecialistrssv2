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
            // Set logout flag
            localStorage.setItem('auth-logout-flag', 'true');
            // Clear login flag
            localStorage.removeItem('auth-login-flag');
            
            // Call server-side logout endpoint
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
            
            // Sign out client-side
            await signOut({ 
              redirect: true,
              callbackUrl: '/?logout=success'
            });
          } catch (error) {
            console.error('Logout sync error:', error);
            // Fallback: force redirect
            localStorage.setItem('auth-logout-flag', 'true');
            localStorage.removeItem('auth-login-flag');
            window.location.href = '/?logout=success';
          }
        }
      } else if (event.data.type === 'LOGIN') {
        // Another tab logged in, sync login state
        if (!session) {
          // Reload to get the session
          window.location.reload();
        }
      }
    };

    channel.addEventListener('message', handleMessage);

    // Also listen for storage events (fallback for older browsers)
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === 'auth-logout' && e.newValue === 'true') {
        if (session) {
          try {
            // Set logout flag
            localStorage.setItem('auth-logout-flag', 'true');
            // Clear login flag
            localStorage.removeItem('auth-login-flag');
            
            // Call server-side logout endpoint
            await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
            });
            
            // Sign out client-side
            await signOut({ 
              redirect: true,
              callbackUrl: '/?logout=success'
            });
            
            // Clear the flag
            localStorage.removeItem('auth-logout');
          } catch (error) {
            console.error('Logout sync error:', error);
            // Clear the flag
            localStorage.removeItem('auth-logout');
            // Fallback: force redirect
            localStorage.setItem('auth-logout-flag', 'true');
            localStorage.removeItem('auth-login-flag');
            window.location.href = '/?logout=success';
          }
        }
      } else if (e.key === 'auth-login' && e.newValue === 'true') {
        // Another tab logged in, sync login state
        if (!session) {
          // Reload to get the session
          window.location.reload();
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

/**
 * Broadcast login to all tabs
 * Call this function when user logs in
 */
export function broadcastLogin() {
  // Set login flag
  localStorage.setItem('auth-login-flag', 'true');
  
  // Clear logout flag
  localStorage.removeItem('auth-logout-flag');
  
  // Use BroadcastChannel
  const channel = new BroadcastChannel('auth-sync');
  channel.postMessage({ type: 'LOGIN' });
  channel.close();

  // Also use localStorage as fallback
  localStorage.setItem('auth-login', 'true');
  // Remove it after a short delay
  setTimeout(() => {
    localStorage.removeItem('auth-login');
  }, 1000);
}
