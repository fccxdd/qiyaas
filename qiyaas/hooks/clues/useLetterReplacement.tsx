// hooks/clues/useLetterReplacement.tsx

// Purpose: Determine if a letter in a given position can be replaced based on verified positions and starting letters.

'use client';

import { useCallback } from 'react';

interface UseLetterReplacementProps {
  verifiedPositions: Map<string, Set<number>>;
  startingLettersSet: React.MutableRefObject<Set<string> | null>;
}

export function useLetterReplacement({
  verifiedPositions,
  startingLettersSet
}: UseLetterReplacementProps) {
  
  /**
   * Check if a position can be replaced with a new letter
   * Returns true if the position is:
   * - Empty (can add letter)
   * - Filled with user-typed letter (can replace)
   * Returns false if the position is:
   * - A verified letter (correct guess)
   * - A starting letter (pre-filled)
   */
  const canReplacePosition = useCallback((
    clue: string,
    position: number,
    wordInputs: Map<number, string>
  ): boolean => {
    
    // Check if position is verified (correct guess)
    const verified = verifiedPositions.get(clue) || new Set();
    if (verified.has(position)) return false;
    
    // If position is empty, we can add a letter
    if (!wordInputs.has(position)) return true;
    
    // If position is filled, check if it's a starting letter
    const letter = wordInputs.get(position)!;
    const clueUpper = clue.toUpperCase();
    const letterUpper = letter.toUpperCase();
    
    const isStartingLetter = 
      clueUpper[position] === letterUpper && 
      (startingLettersSet.current?.has(letterUpper) ?? false);
    
    // Can replace if it's NOT a starting letter
    return !isStartingLetter;
  }, [verifiedPositions, startingLettersSet]);

  return { canReplacePosition };
}