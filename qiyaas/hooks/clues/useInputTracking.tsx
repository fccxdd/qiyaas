// hooks/clues/useInputTracking.tsx

'use client';

import { useEffect } from 'react';

interface UseInputTrackingProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  verifiedPositions: Map<string, Set<number>>;
  allGuessedLetters: Set<string>;
  onWordInputsChange?: (inputs: Map<string, string>) => void;
  onVerifiedPositionsChange?: (verified: Map<string, string>) => void;
}

export function useInputTracking({
  activeClues,
  userInputs,
  verifiedPositions,
  allGuessedLetters,
  onWordInputsChange,
  onVerifiedPositionsChange
}: UseInputTrackingProps) {
  
  // Flatten all userInputs into a single Map for keyboard tracking
  useEffect(() => {
    if (!onWordInputsChange) return;

    const timeoutId = setTimeout(() => {
      const flattenedInputs = new Map<string, string>();
      
      activeClues.forEach((clue, clueIndex) => {
        const wordInputs = userInputs.get(clue);
        if (wordInputs) {
          wordInputs.forEach((letter, position) => {
            const key = `clue${clueIndex}-pos${position}`;
            flattenedInputs.set(key, letter);
          });
        }
      });
      
      onWordInputsChange(flattenedInputs);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [userInputs, activeClues, onWordInputsChange]);

  // Track verified positions and all guessed letters
  useEffect(() => {
    if (!onVerifiedPositionsChange) return;

    const flattenedVerified = new Map<string, string>();
    
    activeClues.forEach((clue, clueIndex) => {
      const verified = verifiedPositions.get(clue);
      if (verified) {
        verified.forEach((position) => {
          const letter = clue[position];
          if (letter) {
            const key = `clue${clueIndex}-pos${position}`;
            flattenedVerified.set(key, letter.toUpperCase());
          }
        });
      }
    });
    
    // Add all guessed letters (even if wrong and cleared)
    let guessCount = 0;
    allGuessedLetters.forEach(letter => {
      const key = `guessed-${guessCount++}`;
      flattenedVerified.set(key, letter);
    });
    
    onVerifiedPositionsChange(flattenedVerified);
  }, [verifiedPositions, allGuessedLetters, activeClues, onVerifiedPositionsChange]);
}