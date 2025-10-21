// hooks/useKeyboard.tsx

import { useEffect } from 'react';

interface UseKeyboardProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

export function useKeyboard({
  onKeyPress,
  onBackspace,
  onEnter,
  enabled = true
}: UseKeyboardProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      // Prevent default for keys we're handling
      if (/^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER') {
        event.preventDefault();
      }

      // Handle letter keys (A-Z)
      if (/^[A-Z]$/.test(key) && onKeyPress) {
        onKeyPress(key);
      }
      // Handle Backspace
      else if (key === 'BACKSPACE' && onBackspace) {
        onBackspace();
      }
      // Handle Enter
      else if (key === 'ENTER' && onEnter) {
        onEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onKeyPress, onBackspace, onEnter, enabled]);
}