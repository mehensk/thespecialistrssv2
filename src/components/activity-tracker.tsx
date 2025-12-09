'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Activity Tracker Component
 * Tracks user activity and updates the session to prevent inactivity timeout
 * This component should be included in protected layouts
 * 
 * Uses a combination of:
 * 1. User activity tracking (mouse, keyboard, scroll, etc.)
 * 2. Periodic heartbeat (every 1 minute) to keep session alive
 * 3. Page visibility tracking
 * 4. Retry logic with error handling
 */
export function ActivityTracker() {
  const { data: session, update } = useSession();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;
  const isUpdatingRef = useRef(false); // Prevent concurrent updates
  const lastUpdateTimeRef = useRef(0); // Track last successful update

  useEffect(() => {
    // Only track activity if user is logged in
    if (!session) {
      return;
    }

    // Check logout flag - don't update if logged out
    const logoutFlag = localStorage.getItem('auth-logout-flag');
    if (logoutFlag) {
      return;
    }

    const updateActivity = async (retryAttempt = 0): Promise<void> => {
      // Prevent concurrent updates - if already updating, skip
      if (isUpdatingRef.current) {
        return;
      }

      // Don't update if we just updated recently (within last 5 seconds)
      // This prevents too frequent updates during rapid typing
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < 5000) {
        return;
      }

      isUpdatingRef.current = true;

      try {
        // Update the session to refresh the lastActivity timestamp
        // This triggers the JWT callback which updates lastActivity
        await update();
        
        // Mark successful update
        lastUpdateTimeRef.current = now;
        
        // Reset error state on success
        setErrorMessage(null);
        retryCountRef.current = 0;
      } catch (error) {
        console.error('Failed to update activity:', error);
        
        // Don't retry if it's a session error (might cause logout/login flicker)
        // Only retry for network/server errors
        const isSessionError = error instanceof Error && (
          error.message.includes('session') ||
          error.message.includes('unauthorized') ||
          error.message.includes('401') ||
          error.message.includes('403')
        );

        if (!isSessionError && retryAttempt < MAX_RETRIES) {
          // Retry logic: retry up to MAX_RETRIES times with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000); // Exponential backoff, max 5s
          setTimeout(() => {
            isUpdatingRef.current = false; // Allow retry
            updateActivity(retryAttempt + 1);
          }, delay);
          retryCountRef.current = retryAttempt + 1;
        } else {
          // Max retries reached or session error - don't show error message
          // to avoid alarming users during normal operation
          retryCountRef.current = 0;
        }
      } finally {
        // Always release the lock after a delay to prevent rapid-fire updates
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 1000);
      }
    };

    // Track various user activities
    const activities = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity updates to every 45 seconds to keep session alive
    // Increased from 30s to reduce frequency during form input
    let lastUpdate = 0;
    const THROTTLE_INTERVAL = 45 * 1000; // 45 seconds

    const handleActivity = () => {
      // Check logout flag before updating
      const logoutFlag = localStorage.getItem('auth-logout-flag');
      if (logoutFlag) {
        return;
      }
      
      // Don't update if already updating
      if (isUpdatingRef.current) {
        return;
      }
      
      const now = Date.now();
      if (now - lastUpdate > THROTTLE_INTERVAL) {
        lastUpdate = now;
        updateActivity();
      }
    };

    // Add event listeners for user activity
    activities.forEach((activity) => {
      window.addEventListener(activity, handleActivity, { passive: true });
    });

    // Also update on page visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const logoutFlag = localStorage.getItem('auth-logout-flag');
        if (!logoutFlag) {
          updateActivity();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic heartbeat: Update session every 2 minutes even if no user activity
    // Reduced frequency to prevent interference with form input
    // This ensures the session stays alive even if user is just reading/typing
    heartbeatIntervalRef.current = setInterval(() => {
      const logoutFlag = localStorage.getItem('auth-logout-flag');
      if (!logoutFlag && !isUpdatingRef.current) {
        // Only update if we haven't updated in the last 30 seconds
        const now = Date.now();
        if (now - lastUpdateTimeRef.current > 30 * 1000) {
          updateActivity();
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Initial update to ensure session is fresh (with delay to avoid race conditions)
    setTimeout(() => {
      if (session && !localStorage.getItem('auth-logout-flag')) {
        updateActivity();
      }
    }, 2000); // 2 second delay to let page fully load

    // Cleanup
    return () => {
      activities.forEach((activity) => {
        window.removeEventListener(activity, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    };
  }, [session, update]);

  // Show error message if activity update fails
  if (errorMessage) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-md shadow-lg text-sm z-50">
        {errorMessage}
      </div>
    );
  }

  // This component doesn't render anything normally
  return null;
}

