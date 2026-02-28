// hooks/keyboard/usePreventRefresh.tsx

import { useEffect } from 'react';

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