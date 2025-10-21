// hooks/usePreventRefresh.tsx

import { useEffect } from 'react';

/**
 * Hook to prevent accidental page refresh with Ctrl+R or browser refresh button
 * Shows a browser confirmation dialog when user attempts to refresh
 */
export function usePreventRefresh() {
  useEffect(() => {
    // Intercept browser refresh and show confirmation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return ''; // Required for some browsers
    };

    // Intercept Ctrl+R and Cmd+R keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        // Trigger beforeunload to show confirmation
        const event = new Event('beforeunload', { cancelable: true });
        if (!window.dispatchEvent(event)) {
          return;
        }
        // If user confirms, reload
        if (window.confirm('Are you sure you want to refresh? All progress will be lost.')) {
          window.location.reload();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

/**
 * Hook to allow Ctrl+R and other keyboard shortcuts to work normally
 * Blocks game keyboard listeners from processing modifier key combinations
 */
export function useAllowKeyboardShortcuts() {
  useEffect(() => {
    const blockModifierKeys = (e: KeyboardEvent) => {
      // If ANY modifier key is pressed, stop the event from reaching game listeners
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.stopImmediatePropagation();
      }
    };

    // Add in CAPTURE phase so it runs BEFORE other listeners
    window.addEventListener('keydown', blockModifierKeys, { capture: true });
    return () => window.removeEventListener('keydown', blockModifierKeys, { capture: true });
  }, []);
}