'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Activity Tracker Component
 * Tracks user activity and updates the session to prevent inactivity timeout
 * This component should be included in protected layouts
 * 
 * Uses a combination of:
 * 1. User activity tracking (mouse, keyboard, scroll, etc.)
 * 2. Periodic heartbeat (every 2 minutes) to keep session alive
 * 3. Page visibility tracking
 */
export function ActivityTracker() {
  const { data: session, update } = useSession();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track activity if user is logged in
    if (!session) {
      return;
    }

    const updateActivity = async () => {
      try {
        // Update the session to refresh the lastActivity timestamp
        // This triggers the JWT callback which updates lastActivity
        await update();
      } catch (error) {
        console.error('Failed to update activity:', error);
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

    // Throttle activity updates to every 30 seconds to keep session alive
    // Reduced from 1 minute to prevent timeout issues
    let lastUpdate = 0;
    const THROTTLE_INTERVAL = 30 * 1000; // 30 seconds

    const handleActivity = () => {
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
        updateActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic heartbeat: Update session every 2 minutes even if no user activity
    // This ensures the session stays alive even if user is just reading/typing
    // Set to 2 minutes (120 seconds) to be well under the 10-minute timeout
    heartbeatIntervalRef.current = setInterval(() => {
      updateActivity();
    }, 2 * 60 * 1000); // 2 minutes

    // Initial update to ensure session is fresh
    updateActivity();

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

  // This component doesn't render anything
  return null;
}

