// hooks/clues/usePositionEditability.tsx

'use client';

import { useCallback } from 'react';

interface UsePositionEditabilityProps {
  verifiedPositions: Map<string, Set<number>>;
  startingLetters?: string;
  additionalLetters?: { vowel?: string; consonant?: string; };
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
    
    // Otherwise return false
    return false;
  }, [startingLetters, additionalLetters]);

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

  // Check if position is empty (no letter entered yet)
  const isPositionEmpty = useCallback((
    position: number,
    wordInputs: Map<number, string>
  ): boolean => {
    return !wordInputs.has(position);
  }, []);

  // Find next editable position after validation (wraps around)
  const findNextEditablePosition = useCallback((
    clue: string,
    wordInputs: Map<number, string>,
    currentPosition?: number
  ): number => {
    const wordLength = clue.length;
    const startPos = currentPosition !== undefined ? currentPosition + 1 : 0;
    
    // Search forward from current position
    for (let i = startPos; i < wordLength; i++) {
      if (isPositionEditable(clue, i, wordInputs)) {
        return i;
      }
    }
    
    // Wrap around: search from beginning
    for (let i = 0; i < startPos; i++) {
      if (isPositionEditable(clue, i, wordInputs)) {
        return i;
      }
    }
    
    // If no editable position found, return first position
    return 0;
  }, [isPositionEditable]);

  // Find next EMPTY position (doesn't wrap, returns null if none found)
  const findNextEmptyPosition = useCallback((
    clue: string,
    fromPosition: number,
    wordInputs: Map<number, string>
  ): number | null => {
    for (let i = fromPosition + 1; i < clue.length; i++) {
      if (isPositionEmpty(i, wordInputs)) {
        return i;
      }
    }
    return null;
  }, [isPositionEmpty]);

  // Find previous EMPTY position (doesn't wrap, returns null if none found)
  const findPreviousEmptyPosition = useCallback((
    fromPosition: number,
    wordInputs: Map<number, string>
  ): number | null => {
    for (let i = fromPosition - 1; i >= 0; i--) {
      if (isPositionEmpty(i, wordInputs)) {
        return i;
      }
    }
    return null;
  }, [isPositionEmpty]);

  // Check if word is completely filled
  const isWordComplete = useCallback((
    clue: string,
    wordInputs: Map<number, string>
  ): boolean => {
    return wordInputs.size === clue.length;
  }, []);

  return {
    isPositionEditable,
    isVerifiedPosition,
    isStartingLetterPosition,
    isAdditionalLetterPosition,
    isPositionEmpty,
    findNextEditablePosition,
    findNextEmptyPosition,
    findPreviousEmptyPosition,
    isWordComplete
  };
}