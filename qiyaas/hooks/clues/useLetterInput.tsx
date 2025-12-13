// hooks/clues/useLetterInput.ts

'use client';

import { useCallback } from 'react';
import { useLetterReplacement } from './useLetterReplacement';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseLetterInputProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  setUserInputs: React.Dispatch<React.SetStateAction<Map<string, Map<number, string>>>>;
  cursorPosition: CursorPosition | null;
  setCursorPosition: (position: CursorPosition) => void;
  verifiedPositions: Map<string, Set<number>>;
  startingLettersSet: React.MutableRefObject<Set<string> | null>;
  moveToNextPosition: (allowClueJump?: boolean) => void;
}

export function useLetterInput({
  activeClues,
  userInputs,
  setUserInputs,
  cursorPosition,
  setCursorPosition,
  verifiedPositions,
  startingLettersSet,
  moveToNextPosition
}: UseLetterInputProps) {
  
  // Use the letter replacement hook to check if positions can be replaced
  const { canReplacePosition } = useLetterReplacement({
    verifiedPositions,
    startingLettersSet
  });
  
  const handleLetterInput = useCallback((key: string) => {
    if (!cursorPosition || !/^[A-Z]$/.test(key)) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    
    if (!wordInputs) return;

    // Check if we can add/replace letter at this position
    if (!canReplacePosition(currentClue, cursorPosition.position, wordInputs)) {
      return; // Position is protected (verified or starting letter)
    }

    // Add or replace the letter
    const newWordInputs = new Map(wordInputs);
    newWordInputs.set(cursorPosition.position, key);
    setUserInputs(prev => new Map(prev).set(currentClue, newWordInputs));

    // Move cursor to next editable position after state update
    // Use setTimeout to ensure state has been updated
    setTimeout(() => {
      moveToNextPosition(false);
    }, 0);
  }, [
    activeClues, 
    userInputs, 
    setUserInputs, 
    cursorPosition, 
    setCursorPosition,
    canReplacePosition,
    moveToNextPosition
  ]);

  return { handleLetterInput };
}