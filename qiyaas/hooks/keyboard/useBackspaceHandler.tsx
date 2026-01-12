// hooks/keyboard/useBackspaceHandler.tsx

'use client';

import { useCallback } from 'react';

interface CursorPosition {
  clueIndex: number;
  position: number;
}

interface UseBackspaceHandlerProps {
  activeClues: string[];
  userInputs: Map<string, Map<number, string>>;
  setUserInputs: React.Dispatch<React.SetStateAction<Map<string, Map<number, string>>>>;
  completedWords: Set<string>;
  verifiedPositions: Map<string, Set<number>>;
  cursorPosition: CursorPosition | null;
  setCursorPosition: (position: CursorPosition) => void;
  startingLettersSet: React.MutableRefObject<Set<string> | null>;
  additionalLetterPositions: Map<string, Set<number>>;
}

export function useBackspaceHandler({
  activeClues,
  userInputs,
  setUserInputs,
  completedWords,
  verifiedPositions,
  cursorPosition,
  setCursorPosition,
  startingLettersSet,
  additionalLetterPositions
}: UseBackspaceHandlerProps) {
  
  const handleBackspace = useCallback(() => {
    if (!cursorPosition) return;

    const currentClue = activeClues[cursorPosition.clueIndex];
    const wordInputs = userInputs.get(currentClue);
    if (!wordInputs) return;

    // Helper function to check if a position is a starting letter
    const isStartingLetter = (clue: string, position: number, letter: string): boolean => {
      const clueUpper = clue.toUpperCase();
      const letterUpper = letter.toUpperCase();
      return clueUpper[position] === letterUpper && (startingLettersSet.current?.has(letterUpper) ?? false);
    };
    
    // Helper function to check if a position can be deleted (not starting, not verified, not additional)
    const canDelete = (clue: string, position: number, inputs: Map<number, string>): boolean => {
      if (!inputs.has(position)) return false;
      const letter = inputs.get(position)!;
      const verified = verifiedPositions.get(clue) || new Set();
      const additionalPositions = additionalLetterPositions.get(clue) || new Set();
      const isStarting = isStartingLetter(clue, position, letter);
      const isAdditional = additionalPositions.has(position);
      return !isStarting && !verified.has(position) && !isAdditional;
    };

    // Helper function to check if a position should be skipped during navigation
    const shouldSkip = (clue: string, position: number): boolean => {
      const verified = verifiedPositions.get(clue) || new Set();
      const additionalPositions = additionalLetterPositions.get(clue) || new Set();
      const inputs = userInputs.get(clue);
      if (!inputs || !inputs.has(position)) return false;
      const letter = inputs.get(position)!;
      const isStarting = isStartingLetter(clue, position, letter);
      return verified.has(position) || isStarting || additionalPositions.has(position);
    };

    // If cursor is on a filled position that can be deleted, delete it
    if (wordInputs.has(cursorPosition.position) && canDelete(currentClue, cursorPosition.position, wordInputs)) {
      const newWordInputs = new Map(wordInputs);
      newWordInputs.delete(cursorPosition.position);
      setUserInputs(prev => new Map(prev).set(currentClue, newWordInputs));
      return;
    }

    // Navigate backwards to the immediately previous position, skipping verified/starting/additional positions
    let targetClueIndex = cursorPosition.clueIndex;
    let targetPosition = cursorPosition.position - 1;
    let targetClue = currentClue;
    let targetWordInputs = wordInputs;

    // Skip verified/starting/additional positions in current word
    while (targetPosition >= 0 && shouldSkip(targetClue, targetPosition)) {
      targetPosition--;
    }

    // If we're at the start of current word (or all positions were skipped), move to previous word
    if (targetPosition < 0) {
      for (let clueIdx = cursorPosition.clueIndex - 1; clueIdx >= 0; clueIdx--) {
        const prevClue = activeClues[clueIdx];
        if (!completedWords.has(prevClue)) {
          targetClueIndex = clueIdx;
          targetClue = prevClue;
          targetPosition = prevClue.length - 1;
          targetWordInputs = userInputs.get(prevClue) || new Map();
          
          // Skip verified/starting/additional positions in previous word
          while (targetPosition >= 0 && shouldSkip(targetClue, targetPosition)) {
            targetPosition--;
          }
          
          if (targetPosition >= 0) break;
        }
      }
    }

    // If we found a valid position to move to
    if (targetPosition >= 0) {
      // Move cursor to that position
      setCursorPosition({ clueIndex: targetClueIndex, position: targetPosition });
      
      // If that position has a deletable letter, delete it
      if (targetWordInputs.has(targetPosition) && canDelete(targetClue, targetPosition, targetWordInputs)) {
        const newWordInputs = new Map(targetWordInputs);
        newWordInputs.delete(targetPosition);
        setUserInputs(prev => new Map(prev).set(targetClue, newWordInputs));
      }
    }
  }, [
    cursorPosition,
    activeClues,
    userInputs,
    completedWords,
    verifiedPositions,
    startingLettersSet,
    additionalLetterPositions,
    setUserInputs,
    setCursorPosition
  ]);

  return { handleBackspace };
}