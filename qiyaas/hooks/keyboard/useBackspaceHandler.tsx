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

    // If cursor is on a filled position that can be deleted, delete it
    if (wordInputs.has(cursorPosition.position) && canDelete(currentClue, cursorPosition.position, wordInputs)) {
      const newWordInputs = new Map(wordInputs);
      newWordInputs.delete(cursorPosition.position);
      setUserInputs(prev => new Map(prev).set(currentClue, newWordInputs));
      return;
    }
    
    // Otherwise, navigate backwards to find either:
    // 1. A deletable letter (user-typed, not starting, not verified, not additional)
    // 2. An empty position to move cursor to
    let targetClueIndex = cursorPosition.clueIndex;
    let targetClue = currentClue;
    let targetWordInputs = wordInputs;
    let positionToDelete = -1;
    let emptyPositionToMoveTo = -1;

    // Search backwards in current word
    for (let i = cursorPosition.position - 1; i >= 0; i--) {
      if (targetWordInputs.has(i)) {
        if (canDelete(targetClue, i, targetWordInputs)) {
          positionToDelete = i;
          break;
        }
      } else {
        if (emptyPositionToMoveTo === -1) {
          emptyPositionToMoveTo = i;
        }
      }
    }

    // If no deletable letter found in current word, search previous words
    if (positionToDelete === -1) {
      for (let clueIdx = targetClueIndex - 1; clueIdx >= 0; clueIdx--) {
        const prevClue = activeClues[clueIdx];
        if (!completedWords.has(prevClue)) {
          const prevWordInputs = userInputs.get(prevClue);
          if (prevWordInputs) {
            for (let i = prevClue.length - 1; i >= 0; i--) {
              if (prevWordInputs.has(i)) {
                if (canDelete(prevClue, i, prevWordInputs)) {
                  targetClueIndex = clueIdx;
                  targetClue = prevClue;
                  targetWordInputs = prevWordInputs;
                  positionToDelete = i;
                  break;
                }
              } else {
                if (emptyPositionToMoveTo === -1) {
                  emptyPositionToMoveTo = i;
                  targetClueIndex = clueIdx;
                  targetClue = prevClue;
                  targetWordInputs = prevWordInputs;
                }
              }
            }
          }
        }
        if (positionToDelete !== -1) break;
      }
    }
    
    // Priority 1: Delete a user-typed letter if found
    if (positionToDelete !== -1) {
      const newWordInputs = new Map(targetWordInputs);
      newWordInputs.delete(positionToDelete);
      setUserInputs(prev => new Map(prev).set(targetClue, newWordInputs));
      setCursorPosition({ clueIndex: targetClueIndex, position: positionToDelete });
    } 
    // Priority 2: Move cursor to empty position for navigation
    else if (emptyPositionToMoveTo !== -1) {
      setCursorPosition({ clueIndex: targetClueIndex, position: emptyPositionToMoveTo });
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