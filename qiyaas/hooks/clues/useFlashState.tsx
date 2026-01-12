// hooks/clues/useFlashState.tsx

import { useState, useCallback } from 'react';
import { GameConfig } from '@/lib/gameConfig';

export type FlashState = 'none' | 'red' | 'yellow' | 'green';

export function useFlashState() {
  const [flashStates, setFlashStates] = useState<Map<string, FlashState>>(new Map());

  const triggerFlash = useCallback((clue: string, state: FlashState, onComplete?: () => void) => {
    
    // Set the flash state
    setFlashStates(prev => new Map(prev).set(clue, state));

    // Auto-clear after duration
    setTimeout(() => {
      setFlashStates(prev => {
        const newMap = new Map(prev);
        newMap.set(clue, 'none');
        return newMap;
      });
      
      if (onComplete) {
        onComplete();
      }
    }, GameConfig.duration.flashDuration);
  }, []);

  const clearFlash = useCallback((clue: string) => {
    setFlashStates(prev => {
      const newMap = new Map(prev);
      newMap.set(clue, 'none');
      return newMap;
    });
  }, []);

  const getFlashState = useCallback((clue: string): FlashState => {
    return flashStates.get(clue) || 'none';
  }, [flashStates]);

  return {
    flashStates,
    triggerFlash,
    clearFlash,
    getFlashState
  };
}