import { useEffect, useState, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeout: number; // in milliseconds
  onIdle: () => void;
  enabled: boolean;
}

export function useIdleTimeout({ timeout, onIdle, enabled }: UseIdleTimeoutOptions) {
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());

  const updateActivity = useCallback(() => {
    setLastActivityTime(Date.now());
  }, []);

  // Check for idle timeout
  useEffect(() => {
    if (!enabled) return;

    const checkIdleTimeout = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      if (timeSinceLastActivity >= timeout) {
        onIdle();
      }
    };

    const interval = setInterval(checkIdleTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [enabled, lastActivityTime, timeout, onIdle]);

  // Track user activity
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
    };
  }, [enabled, updateActivity]);

  return { updateActivity, lastActivityTime };
}
