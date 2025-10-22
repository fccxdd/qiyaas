// hooks/useKeyPress.tsx

// Purpose: Handle physical keyboard and on-screen keyboard input, with support for disabling input.

import { useState, useEffect } from 'react';

interface UseKeyPressProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  disabled?: boolean;
}

export function useKeyPress({ onKeyPress, onBackspace, onEnter, disabled = false }: UseKeyPressProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Handle physical keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled) return;
      
      const key = event.key.toUpperCase();

      // Handle letter keys (A-Z)
      if (/^[A-Z]$/.test(key) && onKeyPress) {
        event.preventDefault();
        setPressedKey(key);
        onKeyPress(key);
      }
      // Handle Backspace
      else if (key === 'BACKSPACE' && onBackspace) {
        event.preventDefault();
        setPressedKey('BACKSPACE');
        onBackspace();
      }
      // Handle Enter
      else if (key === 'ENTER' && onEnter) {
        event.preventDefault();
        setPressedKey('ENTER');
        onEnter();
      }
    };

    // Handle key up to reset pressed key state
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
  }, [onKeyPress, onBackspace, onEnter, disabled]);

  // Handle click events
  const handleKeyClick = (key: string) => {
    if (disabled) return;
    setPressedKey(key);
    onKeyPress?.(key);
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleBackspaceClick = () => {
    if (disabled) return;
    setPressedKey('BACKSPACE');
    onBackspace?.();
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleEnterClick = () => {
    if (disabled) return;
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