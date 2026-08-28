'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AutoLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 15 minutes in milliseconds
  const INACTIVITY_LIMIT = 15 * 60 * 1000; 

  const handleLogout = async () => {
    try {
      // Temporarily disabled to prevent random logouts
      // const supabase = createClient();
      // await supabase.auth.signOut();
      // router.push('/login');
      console.log('AutoLogout triggered, but disabled for debugging.');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Initial setup
    resetTimer();

    // Events to track user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    const activityListener = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, activityListener);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, activityListener);
      });
    };
  }, []);

  return null; // Invisible component
}
