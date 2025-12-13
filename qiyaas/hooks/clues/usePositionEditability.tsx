// hooks/clues/usePositionEditability.tsx

'use client';

import { useCallback } from 'react';

interface UsePositionEditabilityProps {
  verifiedPositions: Map<string, Set<number>>;
  startingLetters?: string;
  additionalLetters?: { vowel?: string; consonant?: string; any?: string };
  additionalLetterPositions: Map<string, Set<number>>;
}

/**
 * Hook to determine if a position can be edited or should be skipped during navigation
 * 
 * A position is NOT editable (should be skipped) if it contains:
 * - A verified letter (correct guess)
 * - A starting letter (pre-filled)
 * - An additional letter position (auto-filled by system)
 */
export function usePositionEditability({
  verifiedPositions,
  startingLetters,
  additionalLetters,
  additionalLetterPositions
}: UsePositionEditabilityProps) {
  
  // Check if a position is verified (confirmed correct)
  const isVerifiedPosition = useCallback((clue: string, position: number): boolean => {
    const verified = verifiedPositions.get(clue) || new Set();
    return verified.has(position);
  }, [verifiedPositions]);

  // Check if position is a starting letter
  const isStartingLetterPosition = useCallback((
    clue: string, 
    position: number, 
    wordInputs: Map<number, string>
  ): boolean => {
    if (!wordInputs.has(position)) return false;
    
    const letter = wordInputs.get(position)!;
    const clueUpper = clue.toUpperCase();
    const letterUpper = letter.toUpperCase();
    
    // Check if it matches the clue at this position
    if (clueUpper[position] !== letterUpper) return false;
    
    // Check if it's in startingLetters
    if (startingLetters) {
      const startingLettersArray = startingLetters.toUpperCase().split('');
      if (startingLettersArray.includes(letterUpper)) return true;
    }
    
    // Check if it's the validated vowel from additionalLetters
    if (additionalLetters?.vowel && additionalLetters.vowel.toUpperCase() === letterUpper) {
      return true;
    }
    
    // Check if it's a validated consonant from additionalLetters
    if (additionalLetters?.consonant && additionalLetters.consonant.toUpperCase() === letterUpper) {
      return true;
    }
    
    // Check if it's a validated bonus letter from additionalLetters
    if (additionalLetters?.any && additionalLetters.any.toUpperCase() === letterUpper) {
      return true;
    }

    // Otherwise return false
    return false;
  }, [startingLetters, additionalLetters]);;

  // Check if position is an additional letter position (auto-filled by system)
  const isAdditionalLetterPosition = useCallback((
    clue: string,
    position: number
  ): boolean => {
    const additionalPositions = additionalLetterPositions.get(clue) || new Set();
    return additionalPositions.has(position);
  }, [additionalLetterPositions]);

  // Main function: Check if position is editable (NOT skipped)
  const isPositionEditable = useCallback((
    clue: string, 
    position: number,
    wordInputs: Map<number, string>
  ): boolean => {
    
    // Skip verified positions
    if (isVerifiedPosition(clue, position)) return false;
    
    // Skip additional letter positions (auto-filled)
    if (isAdditionalLetterPosition(clue, position)) return false;
    
    // Skip starting letters
    if (isStartingLetterPosition(clue, position, wordInputs)) return false;
    
    // Position is editable
    return true;
  }, [isVerifiedPosition, isStartingLetterPosition, isAdditionalLetterPosition]);

  return {
    isPositionEditable,
    isVerifiedPosition,
    isStartingLetterPosition,
    isAdditionalLetterPosition
  };
}