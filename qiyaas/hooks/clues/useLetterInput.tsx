// hooks/clues/useLetterInput.ts

'use client';

import { useCallback, useRef } from 'react';
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
  
  // Track pending cursor movements to avoid race conditions
  const pendingMoveRef = useRef(false);
  
  const handleLetterInput = useCallback((key: string) => {
    if (!cursorPosition || !/^[A-Z]$/.test(key)) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    
    if (!wordInputs) return;

    // Check if we can add/replace letter at this position
    if (!canReplacePosition(currentClue, cursorPosition.position, wordInputs)) {
      return; // Position is protected (verified or starting letter)
    }

    // Prevent overlapping cursor moves
    if (pendingMoveRef.current) return;
    pendingMoveRef.current = true;

    // Add or replace the letter - use functional update to ensure we have latest state
    setUserInputs(prev => {
      const newMap = new Map(prev);
      const newWordInputs = new Map(wordInputs);
      newWordInputs.set(cursorPosition.position, key);
      newMap.set(currentClue, newWordInputs);
      return newMap;
    });

    // Move cursor immediately using queueMicrotask for better mobile performance
    // This executes before the next render but after current execution context
    queueMicrotask(() => {
      moveToNextPosition(false);
      pendingMoveRef.current = false;
    });
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