// hooks/keyboard/useKeyboardArrowNavigation.tsx

'use client';

import { useEffect } from 'react';

interface UseKeyboardArrowNavigationProps {
  isEnabled: boolean;
  moveToNextPosition: () => void;
  moveToPreviousPosition: () => void;
  moveToClueAbove: () => void;
  moveToClueBelow: () => void;
}

export function useKeyboardArrowNavigation({
  isEnabled,
  moveToNextPosition,
  moveToPreviousPosition,
  moveToClueAbove,
  moveToClueBelow
}: UseKeyboardArrowNavigationProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleArrowKeys = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          moveToNextPosition();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveToPreviousPosition();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveToClueAbove();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveToClueBelow();
          break;
      }
    };

    window.addEventListener('keydown', handleArrowKeys);
    return () => window.removeEventListener('keydown', handleArrowKeys);
  }, [isEnabled, moveToNextPosition, moveToPreviousPosition, moveToClueAbove, moveToClueBelow]);
}