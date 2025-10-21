// hooks/useKeyPress.tsx

import { useState, useEffect } from 'react';

interface UseKeyPressProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
}

export function useKeyPress({ onKeyPress, onBackspace, onEnter }: UseKeyPressProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Handle physical keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();

      // Handle letter keys (A-Z)
      if (/^[A-Z]$/.test(key) && onKeyPress) {
        event.preventDefault(); // Only prevent if handler exists
        setPressedKey(key);
        onKeyPress(key);
      }
      // Handle Backspace
      else if (key === 'BACKSPACE' && onBackspace) {
        event.preventDefault(); // Only prevent if handler exists
        setPressedKey('BACKSPACE');
        onBackspace();
      }
      // Handle Enter
      else if (key === 'ENTER' && onEnter) {
        event.preventDefault(); // Only prevent if handler exists
        setPressedKey('ENTER');
        onEnter();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key) || key === 'BACKSPACE' || key === 'ENTER') {
        setPressedKey(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onKeyPress, onBackspace, onEnter]);

  // Handle click events
  const handleKeyClick = (key: string) => {
    setPressedKey(key);
    onKeyPress?.(key);
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleBackspaceClick = () => {
    setPressedKey('BACKSPACE');
    onBackspace?.();
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleEnterClick = () => {
    setPressedKey('ENTER');
    onEnter?.();
    setTimeout(() => setPressedKey(null), 150);
  };

  return {
    pressedKey,
    handleKeyClick,
    handleBackspaceClick,
    handleEnterClick
  };
}