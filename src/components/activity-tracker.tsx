'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Activity Tracker Component
 * Tracks user activity and updates the session to prevent inactivity timeout
 * This component should be included in protected layouts
 */
export function ActivityTracker() {
  const { data: session, update } = useSession();

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

    // Throttle activity updates to once per minute to avoid excessive updates
    let lastUpdate = 0;
    const THROTTLE_INTERVAL = 60 * 1000; // 1 minute

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

    // Cleanup
    return () => {
      activities.forEach((activity) => {
        window.removeEventListener(activity, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, update]);

  // This component doesn't render anything
  return null;
}

