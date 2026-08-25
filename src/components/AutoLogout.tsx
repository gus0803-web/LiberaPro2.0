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
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
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
    // Strict window lock: logout if this is a fresh browser window/tab (sessionStorage is empty)
    // Note: duplicated tabs inherit sessionStorage, so they won't trigger this.
    const isNewWindow = !sessionStorage.getItem('liberapro_session_active');
    if (isNewWindow) {
      sessionStorage.setItem('liberapro_session_active', '1');
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          supabase.auth.signOut().then(() => {
            router.push('/login');
          });
        }
      });
    }
  }, [router]);

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
