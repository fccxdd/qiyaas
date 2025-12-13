// hooks/clues/useStartingLettersValidation.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { GameConfig } from '@/lib/gameConfig';

interface UseStartingLettersValidationProps {
  selectedStartingLetters: string;
  activeClues: string[];
  onLifeLost: () => void;
  onShowMessage: (msg: string, type?: 'error' | 'success' | 'info') => void;
}

export function useStartingLettersValidation({
  selectedStartingLetters,
  activeClues,
  onLifeLost,
  onShowMessage
}: UseStartingLettersValidationProps) {
  
  const [hasLostLifeForNoStartingLetters, setHasLostLifeForNoStartingLetters] = useState(false);

  // Check if starting letters appear in any of the clues
  const startingLettersMatchClues = useMemo(() => {
    if (!selectedStartingLetters) return false;
    
    const startingLettersArray = selectedStartingLetters.toUpperCase().split('');
    
    return activeClues.some(clue => {
      const clueUpper = clue.toUpperCase();
      return startingLettersArray.some(letter => clueUpper.includes(letter));
    });
  }, [selectedStartingLetters, activeClues]);

  // Lose a life if no starting letters match any clues
  useEffect(() => {
    if (!startingLettersMatchClues && !hasLostLifeForNoStartingLetters && selectedStartingLetters) {
      const timeoutId = setTimeout(() => {
        onLifeLost();
        onShowMessage(GameConfig.messages.noStartingLettersMatch);
        setHasLostLifeForNoStartingLetters(true);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [startingLettersMatchClues, hasLostLifeForNoStartingLetters, selectedStartingLetters, onLifeLost, onShowMessage]);

  // Reset the life loss flag when starting letters change
  useEffect(() => {
    setHasLostLifeForNoStartingLetters(false);
  }, [selectedStartingLetters]);

  return { startingLettersMatchClues };
}